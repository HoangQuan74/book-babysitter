import { DbName } from '@lib/common/enums';
import { ICountry } from '@lib/common/interfaces';
import {
  CityEntity,
  CountryEntity,
} from '@lib/core/databases/postgres/entities';
import { BaseRepository } from '@lib/core/repository/base.service';
import { ExceptionUtil } from '@lib/utils/exception-filter';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource, In } from 'typeorm';
import { isEmpty } from 'lodash';

@Injectable()
export class CountryService extends BaseRepository {
  constructor(
    @InjectDataSource(DbName.Postgres)
    private readonly postgresData: DataSource,
    @InjectConnection(DbName.Mongo)
    private readonly mongoData: Connection,
  ) {
    super();
  }

  async getCountry() {
    return await this.getRepository(this.postgresData, CountryEntity)
      .createQueryBuilder('country')
      .leftJoin('country.cities', 'city', 'city.isUserCreated = false')
      .select(['country.id', 'country.name', 'city.id', 'city.name'])
      .getMany();
  }

  async getCities(data) {
    const { languageCode, countryId, isUserCreated = false } = data;
    const query = this.getRepository(this.postgresData, CityEntity)
      .createQueryBuilder('city')
      .select(['city.id AS id', `city.name->'${languageCode}' AS name`]);

    if (countryId) {
      query.where('city.countryId = :countryId', { countryId });
    }

    query.andWhere('city.isUserCreated = :isUserCreated', { isUserCreated });

    return await query.getRawMany();
  }

  async upsertCountry(countries: ICountry[]) {
    try {
      const oldCountries = await this.getCountry();
      const countryIds = countries.map((country) => country.id);
      const countryIdsToDelete = oldCountries
        .map((country) => country.id)
        .filter((id) => !countryIds.includes(id));

      if (!isEmpty(countryIdsToDelete)) {
        await this.softDelete(this.postgresData, CountryEntity, {
          id: In(countryIdsToDelete),
        });
      }

      const oldCities = oldCountries.flatMap((country) => country.cities);
      const newCities = countries.flatMap((country) => country.cities);

      const oldCityIds = oldCities.map((city) => city.id);
      const newCityIds = newCities.map((city) => city.id);

      const cityIdsToDelete = oldCityIds.filter(
        (id) => !newCityIds.includes(id),
      );

      if (!isEmpty(cityIdsToDelete)) {
        await this.softDelete(this.postgresData, CityEntity, {
          id: In(cityIdsToDelete),
        });
      }

      const countriesToSave = countries.map((country) =>
        this.createInstance(this.postgresData, CountryEntity, {
          ...country,
          cities: country.cities.map((city) =>
            this.createInstance(this.postgresData, CityEntity, {
              ...city,
              countryId: country.id,
            }),
          ),
        }),
      );

      return this.create(this.postgresData, CountryEntity, countriesToSave);
    } catch (error) {
      return new ExceptionUtil(error).errorHandler();
    }
  }
}
