import { EFilterAge } from '@lib/common/enums';

const CURRENT_YEAR = new Date().getFullYear();
const START_AGE = parseInt(process.env.STARTING_AGE) || 20;
const END_AGE = parseInt(process.env.ENDING_AGE) || 40;

type LanguageCode = 'vi' | 'ko';

export const convertTime = (duration: number) => {
  return Math.floor(Date.now() / 1000) + duration;
};

export const isOtpGenerationAllowed = (lastOtpTime: Date): boolean => {
  const currentUnixTime = convertTime(0);
  const lastOtpUnixTime = Math.floor(lastOtpTime.getTime() / 1000);
  const otpGenerationDuration = parseInt(
    process.env.OTP_GENERATION_DURATION_SECOND || '60',
  );

  return currentUnixTime - lastOtpUnixTime >= otpGenerationDuration;
};

interface YearFormat {
  startAge: string;
  endAge: string;
  format: (year: number) => string;
}

export const YearFormatConfig: Record<LanguageCode, YearFormat> = {
  vi: {
    startAge: 'Sau năm ',
    endAge: 'Trước năm ',
    format: (year: number) => `Năm ${year}`,
  },
  ko: {
    startAge: '년 이후',
    endAge: '년 이전',
    format: (year: number) => `${year}년`,
  },
};

// TODO: refactor
export const getListYears = (languageCode: LanguageCode) => {
  const years = Array.from(
    { length: END_AGE - START_AGE + 1 },
    (_, index) => CURRENT_YEAR - (START_AGE + index),
  );

  const { startAge, endAge, format } = YearFormatConfig[languageCode];
  return years.map((year, index) => {
    const age = `${CURRENT_YEAR - year}`;
    if (index === 0) {
      return {
        value: year,
        age: languageCode === 'vi' ? `${age} tuổi` : `${age}세`,
        text:
          languageCode === 'vi' ? `${startAge}${year}` : `${year}${startAge}`,
      };
    } else if (index === years.length - 1) {
      return {
        value: year,
        age: languageCode === 'vi' ? `Trên ${age} tuổi` : `${age}세 이상`,
        text: languageCode === 'vi' ? `${endAge}${year}` : `${year}${endAge}`,
      };
    } else {
      return {
        value: year,
        age: languageCode === 'vi' ? `${age} tuổi` : `${age}세`,
        text: format(year),
      };
    }
  });
};

export const getTodayDateRange = (): { start: Date; end: Date } => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return { start: startOfToday, end: endOfToday };
};

export const getDateOfBirthByAge = (age: EFilterAge): Date => {
  const currentYear = new Date().getFullYear();
  let yearOfBirth: number;

  switch (age) {
    case EFilterAge.AGE_20:
      yearOfBirth = currentYear - 29;
      break;
    case EFilterAge.AGE_30:
      yearOfBirth = currentYear - 39;
      break;
    case EFilterAge.AGE_40:
      yearOfBirth = currentYear - 40;
      break;
    default:
      yearOfBirth = currentYear;
  }

  return new Date(yearOfBirth, 0, 1);
};
