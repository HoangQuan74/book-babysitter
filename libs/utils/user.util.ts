import {
  GenderText,
  LanguageLevelText,
  LanguageText,
  NumberOfChildText,
  NumberOfExperienceText,
} from '@lib/common/constants';
import { ELanguage, EUserRole } from '@lib/common/enums';
import { UserEntity } from '@lib/core/databases/postgres/entities';
import { BadRequestException } from '@nestjs/common';
import { YearFormatConfig } from './time.util';

export const generateUserCode = (role: EUserRole, num: number) => {
  const parentCode = 'UR410';
  const babysitterCode = 'AB704';
  const managerCode = 'MN410';

  if (num >= 1e8) throw new BadRequestException('user code is invalid');
  const formattedNum = num.toString().padStart(8, '0');

  let code;
  switch (role) {
    case EUserRole.BABY_SITTER:
      code = `${babysitterCode}${formattedNum}`;
      break;
    case EUserRole.PARENT:
      code = `${parentCode}${formattedNum}`;
      break;
    case EUserRole.MANAGER:
      code = `${managerCode}${formattedNum}`;
      break;
    default:
      throw new BadRequestException('user code is invalid');
  }
  return code;
};

export const generatePassword = () => {
  return Math.random().toString(36).slice(-8).toUpperCase();
};

export const formatUser = (user: UserEntity, langCode: ELanguage) => {
  const CURRENT_YEAR = new Date().getFullYear();
  const START_AGE = parseInt(process.env.STARTING_AGE) || 20;
  const END_AGE = parseInt(process.env.ENDING_AGE) || 40;

  if (user.gender) {
    user.gender = {
      value: user.gender,
      text: GenderText[langCode]?.[user.gender] || user.gender,
    } as any;
  }

  if (user.numExperience) {
    user.numExperience = {
      value: user.numExperience,
      text:
        NumberOfExperienceText[langCode]?.[user.numExperience] ||
        user.numExperience,
    } as any;
  }

  if (user.dob) {
    const { startAge, endAge, format } = YearFormatConfig[langCode];
    const year = parseInt(user.dob.slice(0, 4));
    const age = `${CURRENT_YEAR - year}`;
    let dob: any;
    if (CURRENT_YEAR - year === START_AGE) {
      dob = {
        value: year,
        age: langCode === 'vi' ? `${age} tuổi` : `${age}세`,
        text: langCode === 'vi' ? `${startAge}${year}` : `${year}${startAge}`,
      };
    } else if (CURRENT_YEAR - year >= END_AGE) {
      dob = {
        value: year,
        age: langCode === 'vi' ? `Trên ${age} tuổi` : `${age}세 이상`,
        text: langCode === 'vi' ? `${endAge}${year}` : `${year}${endAge}`,
      };
    } else {
      dob = {
        value: year,
        age: langCode === 'vi' ? `${age} tuổi` : `${age}세`,
        text: format(year),
      };
    }
    user.dob = dob;
  }

  if (user.numChild) {
    user.numChild = {
      value: user.numChild,
      text: NumberOfChildText[langCode]?.[user.numChild] || user.numChild,
    } as any;
  }

  if (user.point?.totalPoint) {
    user.point.totalPoint = parseFloat(user.point.totalPoint.toFixed(0));
  }

  if (user.userLanguages) {
    user.userLanguages = user.userLanguages.map((userLanguage) => {
      const { level, language } = userLanguage;
      const languageCode = language?.languageCode;

      userLanguage.level = {
        text: LanguageLevelText[langCode]?.[languageCode]?.[level],
        value: level,
      } as any;
      userLanguage.language = {
        text: LanguageText[langCode]?.[languageCode],
        value: languageCode,
      } as any;
      return userLanguage;
    });
  }

  return user;
};
