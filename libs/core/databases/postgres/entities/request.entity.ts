import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base-entity';
import {
  RequestContactEntity,
  RequestQuestionEntity,
  RequestReportEntity,
  UserEntity,
} from '.';
import { RequestAbsenceEntity } from './request-absence.entity';

enum ERequestType {
  QUESTION = 'question',
  REPORT = 'report',
  CONTACT_REQUEST = 'contact_request',
  ABSENCE = 'absence',
}

enum ERequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
}

@Entity('requests')
export class RequestEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ERequestType })
  type: ERequestType;

  @Column({ type: 'enum', enum: ERequestStatus })
  status: ERequestStatus;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @OneToMany(() => RequestQuestionEntity, (question) => question.request, {
    cascade: true,
  })
  questions: RequestQuestionEntity[];

  @OneToOne(() => RequestContactEntity, (contact) => contact.request, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  contact: RequestContactEntity;

  @OneToOne(() => RequestReportEntity, (report) => report.request, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  report: RequestReportEntity;

  @OneToOne(() => RequestAbsenceEntity, (absence) => absence.request, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  absence: RequestAbsenceEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  detail: any;
}
