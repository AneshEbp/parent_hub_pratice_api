import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsPositive, IsNumber, Min } from 'class-validator';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class BasePaginationParams
 * @typedef {BasePaginationParams}
 */
@InputType()
export class BasePaginationParams {
  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @IsString()
  @Field({ nullable: true, defaultValue: '' })
  searchText?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @Field({ nullable: true, defaultValue: '_id' })
  @IsString()
  orderBy?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?string}
   */
  @IsString()
  @Field({ nullable: true, defaultValue: 'desc' })
  order?: string;

  /**
   * ${1:Description placeholder}
   *
   * @type {?number}
   */
  @IsPositive()
  @IsNumber()
  @Field({ defaultValue: 5 })
  limit?: number;

  /**
   * ${1:Description placeholder}
   *
   * @type {?number}
   */
  @Min(0)
  @IsNumber()
  @Field({ defaultValue: 0 })
  skip?: number;
}
