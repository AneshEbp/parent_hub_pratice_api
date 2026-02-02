import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class SavePaymentMethodDto {
  @Field({ description: 'Your payment method id to save.' })
  @IsNotEmpty({ message: 'Payment method cannot be empty' })
  paymentMethod: string;

  // @Field(() => String, {
  //   description: 'Your selected payment method userId.',
  //   nullable: true,
  // })
  // userId: string | null;
}
