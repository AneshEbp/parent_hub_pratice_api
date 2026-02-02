import messages from '@api/constants/language';
import { endTypeEnum, repeatFrequencyEnum } from '@app/common/enum/recurrence.enum';
import { isNullOrUndefined } from '@app/common/helpers/genericFunction';
import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMinSize,
  IsDate,
  IsEnum,
  IsIn,
  IsNotEmpty,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

@InputType()
export class RecurrencePatternDTO {
  @Field(() => String)
  @IsEnum(repeatFrequencyEnum)
  @IsNotEmpty({ message: messages.REQUIRED_FIELD('Frequency') })
  frequency: repeatFrequencyEnum;

  @Field()
  @Min(1)
  @IsNotEmpty({ message: messages.REQUIRED_FIELD('Interval') })
  interval: number;

  @Field(() => [Number], { nullable: true })
  @ValidateIf((o) => o.frequency === repeatFrequencyEnum.week)
  @IsIn([0, 1, 2, 3, 4, 5, 6], { each: true })
  @ArrayMinSize(1)
  daysOfWeek: number[];

  @Field({ nullable: true })
  @ValidateIf((o) => o.frequency === repeatFrequencyEnum.month && !isNullOrUndefined(o.weekOfMonth))
  @Min(0)
  @Max(6)
  @IsNotEmpty({
    message: messages.REQUIRED_FIELD('Day of week'),
  })
  dayOfWeek: number;

  @Field({ nullable: true })
  @ValidateIf((o) => o.frequency === repeatFrequencyEnum.month && isNullOrUndefined(o.dayOfMonth))
  @Min(0)
  @Max(6) // first(0) - sixth(5) / last(6) week of month
  @IsNotEmpty({
    message: messages.REQUIRED_FIELD('Week of month or day of month'),
  })
  weekOfMonth: number;

  @Field({ nullable: true })
  @ValidateIf(
    (o) =>
      (o.frequency === repeatFrequencyEnum.month && isNullOrUndefined(o.weekOfMonth)) ||
      o.frequency === repeatFrequencyEnum.year,
  )
  @Min(1)
  @Max(31) // 1 - 31
  @IsNotEmpty({
    message: messages.REQUIRED_FIELD('Day of month'),
  })
  dayOfMonth: number;

  @Field({ nullable: true })
  @ValidateIf((o) => o.frequency === repeatFrequencyEnum.year)
  @Min(0)
  @Max(11) // 0 - 11
  @IsNotEmpty({ message: messages.REQUIRED_FIELD('Month of year') })
  monthOfYear: number;

  @Field(() => String)
  @IsEnum(endTypeEnum)
  @IsNotEmpty({ message: messages.REQUIRED_FIELD('End type') })
  endType: endTypeEnum;

  @Field({ nullable: true })
  @ValidateIf((o) => o.endType === endTypeEnum.date)
  @IsDate()
  @IsNotEmpty({ message: messages.REQUIRED_FIELD('End date') })
  endDate: Date;

  @Field({ nullable: true })
  @ValidateIf((o) => o.endType === endTypeEnum.occurrence)
  @IsNotEmpty({ message: messages.REQUIRED_FIELD('End after occurrence') })
  @Max(365)
  endAfterOccurrence: number;
}
