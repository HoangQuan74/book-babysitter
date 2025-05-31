import { IBaseEntity } from '@lib/common/interfaces';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export abstract class BaseEntity implements IBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'timestamp',
    name: 'created_at',
    transformer: {
      to: (value: Date) => (value ? new Date(value).toISOString() : null),
      from: (value: string) => (value ? new Date(value) : null),
    },
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    name: 'updated_at',
    transformer: {
      to: (value: Date) => (value ? new Date(value).toISOString() : null),
      from: (value: string) => (value ? new Date(value) : null),
    },
  })
  updatedAt: Date;

  @DeleteDateColumn({
    select: false,
    transformer: {
      to: (value: Date) => (value ? new Date(value).toISOString() : null),
      from: (value: string) => (value ? new Date(value) : null),
    },
  })
  deletedAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
