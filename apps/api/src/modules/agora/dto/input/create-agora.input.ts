import { InputType, Int, Field } from '@nestjs/graphql';

/**
 * ${1:Description placeholder}
 *
 * @export
 * @class CreateAgoraInput
 * @typedef {CreateAgoraInput}
 */
@InputType()
export class CreateAgoraInput {
  /**
   * ${1:Description placeholder}
   *
   * @type {number}
   */
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
