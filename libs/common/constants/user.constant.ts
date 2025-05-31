import {
  EAgeType,
  EFilterAge,
  ENumberOfChild,
  ENumberOfExperience,
  EnumGender,
  ERating,
  ESortBabysitter,
  ETargetUserType,
} from '../enums';

export const NumberOfChildText = {
  vi: {
    [ENumberOfChild.NO_CHILD]: 'Không có',
    [ENumberOfChild.ONE_CHILD]: '1 người',
    [ENumberOfChild.TWO_OR_MORE_CHILDREN]: 'Trên 2 con',
  },
  ko: {
    [ENumberOfChild.NO_CHILD]: '없음',
    [ENumberOfChild.ONE_CHILD]: '1명',
    [ENumberOfChild.TWO_OR_MORE_CHILDREN]: '2명 이상',
  },
};

export const NumberOfExperienceText = {
  vi: {
    [ENumberOfExperience.UNDER_3_YEARS]: 'Dưới 3 năm',
    [ENumberOfExperience.OVER_3_YEARS]: 'Trên 3 năm',
    [ENumberOfExperience.OVER_5_YEARS]: 'Trên 5 năm',
    [ENumberOfExperience.OVER_7_YEARS]: 'Trên 7 năm',
  },
  ko: {
    [ENumberOfExperience.UNDER_3_YEARS]: '3년 미만',
    [ENumberOfExperience.OVER_3_YEARS]: '3년 이상',
    [ENumberOfExperience.OVER_5_YEARS]: '5년 이상',
    [ENumberOfExperience.OVER_7_YEARS]: '7년 이상',
  },
};

export const TargetUserType = {
  vi: {
    [ETargetUserType.ALL]: 'Tất cả',
    [ETargetUserType.BABY_SITTER]: 'Người chăm trẻ',
    [ETargetUserType.PARENT]: 'Người bảo hộ',
  },
  ko: {
    [ETargetUserType.ALL]: '전체',
    [ETargetUserType.BABY_SITTER]: '베이비 시터',
    [ETargetUserType.PARENT]: '보호자',
  },
};

export const FilterAgeText = {
  vi: {
    [EFilterAge.AGE_20]: '20 Tuổi',
    [EFilterAge.AGE_30]: '30 Tuổi',
    [EFilterAge.AGE_40]: 'Trên 40 Tuổi',
  },
  ko: {
    [EFilterAge.AGE_20]: '20대',
    [EFilterAge.AGE_30]: '30대',
    [EFilterAge.AGE_40]: '40대 이상',
  },
};

export const RatingText = {
  vi: {
    [ERating.ONE]: '1 Sao',
    [ERating.TWO]: '2 Sao',
    [ERating.THREE]: '3 Sao',
    [ERating.FOUR]: '4 Sao',
    [ERating.FIVE]: '5 Sao',
  },
  ko: {
    [ERating.ONE]: '1개 이상',
    [ERating.TWO]: '2개 이상',
    [ERating.THREE]: '3개 이상',
    [ERating.FOUR]: '4개 이상',
    [ERating.FIVE]: '5개 이상',
  },
};

export const SortBabysitterText = {
  vi: {
    [ESortBabysitter.HIGHEST_SALARY]: 'Lương cao nhất',
    [ESortBabysitter.LOWEST_SALARY]: 'Lương thấp nhất',
    [ESortBabysitter.HIGHEST_RATING]: 'Đánh giá cao nhất',
    [ESortBabysitter.MOST_REVIEWED]: 'Nhiều đánh giá nhất',
  },
  ko: {
    [ESortBabysitter.HIGHEST_SALARY]: '시급 높은 순 먼저보기',
    [ESortBabysitter.LOWEST_SALARY]: '시급 낮은 순 먼저보기',
    [ESortBabysitter.HIGHEST_RATING]: '평점 높은 순 먼저 보기',
    [ESortBabysitter.MOST_REVIEWED]: '리뷰 많은 순 먼저 보기',
  },
};

export const AgeOfChildText = (age: number) => {
  return {
    [EAgeType.MONTH]: {
      vi: `Tròn ${age} tháng tuổi`,
      ko: `만 ${age}개월`,
    },
    [EAgeType.YEAR]: {
      vi: age < 6 ? `Tròn ${age} tuổi` : `Trên ${age} tuổi`,
      ko: `만 ${age}${age < 6 ? '세' : '세 이상'}`,
    },
  };
};
