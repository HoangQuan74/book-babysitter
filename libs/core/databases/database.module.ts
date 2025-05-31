import { ormMapping } from '@lib/common/constants';
import { DbConfig, DbName } from '@lib/common/enums';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

type options = {
  dbConfig: Partial<Record<DbName, DbConfig>>;
  getConfig: (cf: DbConfig) => (a: ConfigService) => any;
};

@Module({})
export class DatabaseModule {
  static register(options: options): DynamicModule[] {
    const modules = [];

    for (const database in options.dbConfig) {
      const orm = ormMapping[database];
      const config = options.dbConfig[database];

      let identityName = 'connectionName';
      if (orm === TypeOrmModule) identityName = 'name';

      modules.push(
        orm.forRootAsync({
          [identityName]: database,
          useFactory: options.getConfig(config),
          inject: [ConfigService],
        }),
      );
    }

    if (modules.length <= 0) console.info('Empty import ORM modules !!!');

    return modules;
  }
}
