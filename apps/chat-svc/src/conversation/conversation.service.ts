import { DbName } from '@lib/common/enums';
import { ConversationMessage } from '@lib/core/databases/mongo/entities';
import {
  ConversationEntity,
  ConversationParticipantEntity,
  UserEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In, Not } from 'typeorm';
import { map, keyBy } from 'lodash';
import { IRequestUser } from '@lib/common/interfaces';
import { errorMessage } from '@lib/common/constants';
import { MessageService } from '../message/message.service';
import { isEmpty } from 'lodash';

@Injectable()
export class ConversationService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,

    private readonly messageService: MessageService,
  ) {
    super();
  }

  async getListConversation(query: any, reqUser?: IRequestUser) {
    try {
      const { page, limit: size, userCode } = query;
      let userId = reqUser?.userId;

      if (userCode) {
        const userInfo = await this.getOne(this.postgresData, UserEntity, {
          where: {
            userCode,
          },
        });
        if (!userInfo) {
          throw new BadRequestException(errorMessage.NOT_FOUND);
        }
        userId = userInfo.id;
      }

      const { results, total } = await this.getPagination(
        this.postgresData,
        ConversationParticipantEntity,
        { page, size },
        {
          where: {
            userId: userId,
            conversation: {
              isAdmin: false,
            },
          },
          order: {
            isPinned: 'DESC',
            updatedAt: 'DESC',
          },
        },
      );
      const conversationIds = map(results, 'conversationId');
      if (isEmpty(conversationIds)) {
        return { results: [], total: 0 };
      }
      const model = this.getSchemaLessModel(
        this.mongoData,
        ConversationMessage,
      );
      const [recentMsg, partners] = await Promise.all([
        model.aggregate([
          {
            $match: { conversationId: { $in: conversationIds } },
          },
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: '$conversationId',
              msg: {
                $last: '$content',
              },
              createdAt: {
                $last: '$createdAt',
              },
              isSeen: {
                $last: '$isSeen',
              },
              from: {
                $last: '$from',
              },
            },
          },
        ]),
        this.getRepository(this.postgresData, ConversationParticipantEntity)
          .createQueryBuilder('conversationParticipant')
          .withDeleted()
          .innerJoin('conversationParticipant.user', 'user')
          .leftJoinAndMapOne(
            'user.avatar',
            'user.userImages',
            'avatar',
            'avatar.order = 0',
          )
          .where(
            'conversationParticipant.conversationId IN (:...conversationIds)',
            { conversationIds },
          )
          .andWhere('conversationParticipant.userId != :userId', { userId })
          .select([
            'conversationParticipant.id',
            'conversationParticipant.conversationId',
            'user.id',
            'user.username',
            'user.role',
            'user.role',
            'user.userCode',
            'user.createdAt',
            'user.email',
            'avatar.url',
          ])
          .getMany(),
      ]);
      const conversationMsgByIds = keyBy(recentMsg, '_id');
      const partnerByIds = keyBy(partners, 'conversationId');
      results.map((con) => {
        const latestMsg = conversationMsgByIds[con.conversationId];
        const partner = partnerByIds[con.conversationId].user;
        con = Object.assign(con, { latestMsg, partner });
      });
      return { results, total };
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async createConversation(data) {
    try {
      const { userId: sender } = data.user;
      const { to: receiver } = data.body;
      const existedMessage = await this.getOne(
        this.mongoData,
        ConversationMessage,
        {
          $or: [
            {
              from: sender,
              to: receiver,
            },
            { from: receiver, to: sender },
          ],
        },
      );
      if (existedMessage) {
        return { conversationId: existedMessage.conversationId };
      }

      const existUser = await this.exist(this.postgresData, UserEntity, {
        where: { id: receiver },
      });

      if (!existUser) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      const conversation = await this.create(
        this.postgresData,
        ConversationEntity,
        {},
      );
      const { id: conversationId } = conversation;
      await Promise.all([
        this.create(this.postgresData, ConversationParticipantEntity, {
          conversationId,
          userId: sender,
        }),
        this.create(this.postgresData, ConversationParticipantEntity, {
          conversationId,
          userId: receiver,
        }),
      ]);
      return { conversationId };
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getConversationById(
    conversationId: string,
    query?: any,
    reqUser?: IRequestUser,
  ) {
    try {
      const conversation = await this.getOne(
        this.postgresData,
        ConversationParticipantEntity,
        {
          where: {
            conversationId: conversationId,
            userId: reqUser?.userId,
          },
        },
      );

      if (!conversation) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      const { page, limit } = query;

      this.update(
        this.mongoData,
        ConversationMessage,
        { conversationId: conversationId, to: reqUser.userId, isSeen: false },
        { isSeen: true, seenAt: new Date() },
      );

      return this.getPagination(
        this.mongoData,
        ConversationMessage,
        { page, size: limit },
        {
          createdAt: { $gt: conversation.createdAt },
          conversationId: conversationId,
        },
      );
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async getConversationByUserId(userId: string, reqUser: IRequestUser) {
    try {
      const conversationId =
        await this.messageService.createOrRestoreConversation(
          userId,
          reqUser.userId,
          false,
        );

      const conversation = await this.getOne(
        this.postgresData,
        ConversationParticipantEntity,
        {
          where: { conversationId: conversationId, userId: reqUser.userId },
          withDeleted: true,
        },
      );

      const partner = await this.getRepository(this.postgresData, UserEntity)
        .createQueryBuilder('user')
        .withDeleted()
        .leftJoinAndMapOne(
          'user.avatar',
          'user.userImages',
          'avatar',
          'avatar.order = 0',
        )
        .andWhere('user.id = :userId', { userId })
        .select([
          'user.id',
          'user.username',
          'user.role',
          'user.role',
          'user.userCode',
          'user.createdAt',
          'user.email',
          'avatar.url',
        ])
        .getOne();
      return { ...conversation, partner };
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  async toggleMuteConversation(reqUser: IRequestUser, id: string) {
    try {
      const { userId } = reqUser;
      const conversation = await this.getOne(
        this.postgresData,
        ConversationParticipantEntity,
        {
          where: { conversationId: id, userId },
        },
      );
      if (!conversation) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      return await this.update(
        this.postgresData,
        ConversationParticipantEntity,
        { id: conversation.id },
        { isMuted: !conversation.isMuted },
      );
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async togglePinConversation(reqUser: IRequestUser, id: string) {
    try {
      const { userId } = reqUser;
      const conversation = await this.getOne(
        this.postgresData,
        ConversationParticipantEntity,
        {
          where: { conversationId: id, userId },
        },
      );
      if (!conversation) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }

      return await this.update(
        this.postgresData,
        ConversationParticipantEntity,
        { id: conversation.id },
        { isPinned: !conversation.isPinned },
      );
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async deleteConversation(id: string, reqUser: IRequestUser) {
    try {
      const { userId } = reqUser;
      const conversationParticipant = await this.getOne(
        this.postgresData,
        ConversationParticipantEntity,
        {
          where: { conversationId: id, userId },
        },
      );
      if (!conversationParticipant) {
        throw new BadRequestException(errorMessage.NOT_FOUND);
      }
      return await this.update(
        this.postgresData,
        ConversationParticipantEntity,
        { id: conversationParticipant.id },
        {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      );
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }

  async getConversationAdminAndUser(reqUser: IRequestUser, userId: string) {
    try {
      let conversation = await this.getOne(
        this.postgresData,
        ConversationEntity,
        {
          where: {
            isAdmin: true,
            participants: { userId: userId },
          },
          withDeleted: true,
          relations: ['participants'],
          select: {
            id: true,
            participants: {
              updatedAt: true,
            },
          },
        },
      );

      if (!conversation) {
        conversation = await this.create(
          this.postgresData,
          ConversationEntity,
          {
            isAdmin: true,
            participants: [{ userId: userId }],
          },
        );
      }

      const countMessageNotSeen = await this.count(
        this.mongoData,
        ConversationMessage,
        {
          conversationId: conversation.id,
          to: reqUser.userId,
          isSeen: false,
        },
      );

      return { conversation, countMessageNotSeen };
    } catch (error) {
      const exception = new ExceptionUtil(error);
      return exception.errorHandler();
    }
  }
}
