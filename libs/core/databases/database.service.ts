import { ormMapping } from '@lib/common/constants';
import * as entities from './postgres/entities';

export function mapEntities(entities) {
  const map = [];
  for (const database in entities) {
    const getValue = entities[database];
    const findModule = ormMapping[database] || null;
    if (!findModule) console.debug('Could not found implement ORM');
    map.push(findModule.forFeature(getValue, database));
  }
  if (map.length <= 0) console.debug('Empty entities map !!!!!');
  return map;
}

export function getEntitiesPostgres() {
  const entitiesArr = [];

  for (const entity in entities) {
    entitiesArr.push(entities[entity]);
  }

  return entitiesArr;
}
