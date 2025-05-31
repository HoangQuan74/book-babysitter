import { IRequestUser } from '@lib/common/interfaces';

export const formatKey = (reqUser: IRequestUser, key: string) => {
  const keyFormat = `${reqUser.role}/${reqUser.userId}/${Date.now()}-${key}`;
  return keyFormat;
};

export function roundRating(rating: number): number {
  const wholePart = Math.floor(rating);
  const fractionalPart = rating - wholePart;

  if (fractionalPart <= 0.5) {
    return wholePart + 0.5;
  } else {
    return wholePart + 1;
  }
}
