import { InputType, Int, Field, PartialType } from '@nestjs/graphql';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class CreateUserInput
 * @typedef {CreateUserInput}
 */
@InputType()
export class CreateUserInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {number}
   */
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class UpdateUserInput
 * @typedef {UpdateUserInput}
 * @extends {PartialType(CreateUserInput)}
 */
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  /**
   * ${1:Description placeholder}
   *
   * @type {number}
   */
  @Field(() => Int)
  id: number;
}
