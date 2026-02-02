import { repeatFrequencyEnum } from '@app/common/enum/recurrence.enum';
import { ManipulateType } from 'dayjs';

export const GENERATE_RECURRING_EVENTS_FOR_DAY = 365;
export const GENERATE_RECURRING_EVENTS_FOR_WEEK = 52;
export const GENERATE_RECURRING_EVENTS_FOR_MONTH = 12;
export const GENERATE_RECURRING_EVENTS_FOR_YEAR = 10;

export const MAX_DATE_VALUE_FOR_NEVER = '9999-12-31';

export function diffUnitMapDayJs(frequency: keyof typeof repeatFrequencyEnum): ManipulateType {
  switch (frequency) {
    case 'day':
      return 'day';

    case 'week':
      return 'week';

    case 'month':
      return 'month';

    case 'year':
      return 'year';
  }
}

export const maxCountMap = {
  [repeatFrequencyEnum.day]: GENERATE_RECURRING_EVENTS_FOR_DAY,
  [repeatFrequencyEnum.week]: GENERATE_RECURRING_EVENTS_FOR_WEEK,
  [repeatFrequencyEnum.month]: GENERATE_RECURRING_EVENTS_FOR_MONTH,
  [repeatFrequencyEnum.year]: GENERATE_RECURRING_EVENTS_FOR_YEAR,
};

export const weekDays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];
