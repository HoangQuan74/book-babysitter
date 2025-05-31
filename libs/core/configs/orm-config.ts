import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { configuration } from './configuration';
import { join } from 'path';
dotenv.config();
const config = configuration();

export const dataSourceOptions: DataSourceOptions = {
  type: config.db.postgres.type as 'mysql' | 'postgres',
  host: config.db.postgres.host,
  port: config.db.postgres.port as number,
  username: config.db.postgres.username,
  password: config.db.postgres.password,
  database: config.db.postgres.database,
  migrations: ['./libs/core/databases/postgres/migrations/*.ts'],
  migrationsTableName: 'migrations_typeorm',
  entities: ['./libs/core/databases/postgres/entities/*.entity.ts'],
  // synchronize: config.db.postgres.synchronize,
  // maxQueryExecutionTime: 300,
  // migrationsTransactionMode: 'all',
  // logger: 'file',
};

export default new DataSource(dataSourceOptions);
