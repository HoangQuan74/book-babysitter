import { errorMessage } from '@lib/common/constants';
import {
  DbName,
  ELanguage,
  ETargetUserType,
  EUserRole,
  ScheduleType,
} from '@lib/common/enums';
import { ICurrency } from '@lib/common/interfaces';
import { CurrencyEntity } from '@lib/core/databases/postgres/entities/currency.entity';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Connection } from 'mongoose';
import { DataSource, In } from 'typeorm';
import { isEmpty } from 'lodash';
import { EPostType, PostEntity } from '@lib/core/databases/postgres/entities';

@Injectable()
export class MetaDataService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getCurrency() {
    const currencies = await this.getMany(
      this.postgresData,
      CurrencyEntity,
      {},
    );
    currencies.forEach((currency) => {
      currency.rangeSalaries = this.generateSalary(
        currency.minSalary,
        currency.maxSalary,
        currency.step,
      );
    });
    return currencies;
  }

  async saveCurrencies(currencies: ICurrency[]) {
    try {
      this.validateUnixUniqueness(currencies);
      const currencyRepo = this.getRepository(
        this.postgresData,
        CurrencyEntity,
      );
      const oldCurrencies = await this.getMany(
        this.postgresData,
        CurrencyEntity,
      );

      const currenciesToDelete = oldCurrencies
        .filter(
          (currency) =>
            !currencies.find((newCurrency) => newCurrency.id === currency.id),
        )
        .map((currency) => currency.id);

      if (!isEmpty(currenciesToDelete)) {
        const currenciesIsUsed = await currencyRepo
          .createQueryBuilder('currency')
          .innerJoin('currency.bookings', 'booking')
          .innerJoin('currency.users', 'user')
          .where('currency.id IN (:...ids)', { ids: currenciesToDelete })
          .getExists();

        if (currenciesIsUsed) {
          throw new BadRequestException(errorMessage.CURRENCY_CANT_BE_DELETED);
        }
      }

      await this.delete(this.postgresData, CurrencyEntity, {
        id: In(currenciesToDelete),
      });

      const oldCurrencyMap = new Map(
        oldCurrencies.map((currency) => [currency.id, currency]),
      );

      const updatedCurrencies: CurrencyEntity[] = [];

      for (const newCurrency of currencies) {
        const existingCurrency = oldCurrencyMap.get(newCurrency.id);

        if (existingCurrency) {
          const mergedCurrency = currencyRepo.merge(
            existingCurrency,
            newCurrency,
          );
          updatedCurrencies.push(mergedCurrency);
        } else {
          const newCurrencyEntity = currencyRepo.create(newCurrency);
          updatedCurrencies.push(newCurrencyEntity);
        }
      }

      return await currencyRepo.save(updatedCurrencies);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }

  private validateUnixUniqueness(currencies: ICurrency[]): void {
    const unitValues = new Set<string>();
    const duplicates = new Set<string>();

    currencies.forEach((currency) => {
      if (unitValues.has(currency.unit)) {
        duplicates.add(currency.unit);
      } else {
        unitValues.add(currency.unit);
      }
    });

    if (duplicates.size > 0) {
      throw new BadRequestException(errorMessage.INVALID_CURRENCY_INFO);
    }
  }

  generateSalary(minSalary, maxSalary, step: number): number[] {
    const length = (maxSalary - minSalary) / step + 1;
    return Array.from({ length }, (_, i) => minSalary + i * step);
  }

  async getSchedule(date: Date, scheduleType: ScheduleType) {
    const startDate = moment(date);
    let days: string[] = [];

    if (scheduleType === ScheduleType.WEEK) {
      const startOfWeek = startDate.clone().startOf('week');
      const endOfWeek = startDate.clone().endOf('week');

      days = [];
      let currentDay = startOfWeek.clone();

      while (currentDay.isSameOrBefore(endOfWeek)) {
        days.push(currentDay.format('YYYY-MM-DD'));
        currentDay.add(1, 'days');
      }
    } else if (scheduleType === ScheduleType.MONTH) {
      const startOfMonth = startDate.clone().startOf('month').startOf('week');
      const endOfMonth = startDate.clone().endOf('month').endOf('week');

      let currentDay = startOfMonth.clone();
      while (currentDay.isSameOrBefore(endOfMonth)) {
        days.push(currentDay.format('YYYY-MM-DD'));
        currentDay.add(1, 'days');
      }
    }

    return days;
  }

  async getLicense(app: EUserRole, lang: ELanguage) {
    return this.getOne(this.postgresData, PostEntity, {
      where: {
        type: { type: EPostType.OPEN_SOURCE },
        targetUserType: In([ETargetUserType.ALL, app]),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
