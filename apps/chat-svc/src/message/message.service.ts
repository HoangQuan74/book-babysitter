import { DbName } from '@lib/common/enums';
import { IRequestUser } from '@lib/common/interfaces';
import { ConversationMessage } from '@lib/core/databases/mongo/entities';
import {
  ConversationEntity,
  ConversationParticipantEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { isEmpty } from 'lodash';

@Injectable()
export class MessageService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async createMessage(data: {
    conversationId?: string;
    receiver: string;
    sender: string;
    content: string;
    files: any;
  }) {
    try {
      const { conversationId, receiver, sender, content, files } = data;
      let finalConversationId: string;
      let urls = [];
      let urlPresigned = [];
      if (!isEmpty(files)) {
        urls = files.map((file: { url: string }) => file.url);
        urlPresigned = files.map(
          (file: { urlPresigned: string }) => file.urlPresigned,
        );
      }

      if (!conversationId) {
        finalConversationId = await this.createOrRestoreConversation(
          receiver,
          sender,
        );
      } else {
        finalConversationId = await this.checkAndRestoreConversation(
          conversationId,
          receiver,
          sender,
        );
      }

      await this.updateConversationTimestamp(finalConversationId);

      const result = await this.create(this.mongoData, ConversationMessage, {
        conversationId: finalConversationId,
        from: sender,
        to: receiver,
        content,
        files: urls,
      });
      return { ...result, files: urlPresigned };
    } catch (error) {}
  }

  private async checkAndRestoreConversation(
    conversationId: string,
    receiver: string,
    sender: string,
  ): Promise<string> {
    await this.restoreParticipant(conversationId, receiver);
    await this.restoreParticipant(conversationId, sender);
    return conversationId;
  }

  private async restoreParticipant(conversationId: string, userId: string) {
    const participant = await this.getRepository(
      this.postgresData,
      ConversationParticipantEntity,
    ).findOne({
      where: { conversationId, userId },
      select: { id: true, deletedAt: true },
      withDeleted: true,
    });
    if (participant && participant.deletedAt) {
      await this.update(
        this.postgresData,
        ConversationParticipantEntity,
        { id: participant.id },
        { deletedAt: null, createdAt: new Date(), updatedAt: new Date() },
      );
    }
  }

  async createOrRestoreConversation(
    receiver: string,
    sender: string,
    createConversation = true,
  ): Promise<string> {
    const existedConversation = await this.findExistingConversation(
      receiver,
      sender,
    );

    if (!createConversation && existedConversation) {
      return existedConversation.id;
    }

    if (existedConversation) {
      await this.restoreParticipant(existedConversation.id, receiver);
      await this.restoreParticipant(existedConversation.id, sender);
      return existedConversation.id;
    }

    const conversation = await this.create(
      this.postgresData,
      ConversationEntity,
      {
        participants: [
          {
            userId: sender,
            deletedAt: createConversation ? null : new Date(),
          },
          {
            userId: receiver,
            deletedAt: createConversation ? null : new Date(),
          },
        ],
      },
    );
    return conversation.id;
  }

  async findExistingConversation(receiver: string, sender: string) {
    return this.getRepository(this.postgresData, ConversationEntity)
      .createQueryBuilder('conversation')
      .withDeleted()
      .innerJoin(
        'conversation.participants',
        'participants',
        'participants.userId IN (:userId1, :userId2)',
        { userId1: sender, userId2: receiver },
      )
      .groupBy('conversation.id')
      .having('COUNT(DISTINCT participants.userId) = 2')
      .getOne();
  }

  private async updateConversationTimestamp(conversationId: string) {
    await this.update(
      this.postgresData,
      ConversationParticipantEntity,
      { conversationId: conversationId },
      { updatedAt: new Date() },
    );
  }

  async getConversationMessage(data) {
    const { limit, page, conversationId } = data;
    const result = await this.getPagination(
      this.mongoData,
      ConversationMessage,
      { page, size: limit },
      { conversationId },
    );

    const userId = await this.getOne(
      this.postgresData,
      ConversationParticipantEntity,
      {
        where: {
          conversationId,
        },
        select: { userId: true },
      },
    );

    return { ...result, userId: userId.userId };
  }

  async seenMessage(id: string, reqUser: IRequestUser) {
    return await this.update(
      this.mongoData,
      ConversationMessage,
      { conversationId: id, to: reqUser.userId, isSeen: false },
      { isSeen: true, seenAt: new Date() },
    );
  }
}
