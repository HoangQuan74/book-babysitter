import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbConfig, DbName } from '../enums';

export const dbConfig: Partial<Record<DbName, DbConfig>> = {
  [DbName.Postgres]: DbConfig.Postgres,
  [DbName.Mongo]: DbConfig.Mongo,
};

export const ormMapping = {
  [DbName.Postgres]: TypeOrmModule,
  [DbName.Mongo]: MongooseModule,
};
