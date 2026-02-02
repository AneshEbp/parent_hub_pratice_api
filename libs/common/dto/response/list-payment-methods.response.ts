import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingDetail {
  @Field({
    nullable: true,
    description: 'Name of the customer.',
  })
  name?: string;
}

@ObjectType()
export class PaymentMethodDetails {
  @Field({
    nullable: true,
    description: 'Different brands representating card like visa, master, etc.',
  })
  paymentMethod?: string;

  @Field({
    nullable: true,
    description: 'Different brands representating card like visa, master, etc.',
  })
  exp_month?: number;

  @Field({
    nullable: true,
    description: 'Different brands representating card like visa, master, etc.',
  })
  exp_year?: number;

  @Field({
    nullable: true,
    description: 'Different brands representating card like visa, master, etc.',
  })
  last4: number;
}

@ObjectType()
export class PaymentMethod {
  @Field({ nullable: true })
  id: string;

  @Field(() => PaymentMethodDetails, { nullable: true })
  method: PaymentMethodDetails;

  @Field(() => BillingDetail, { nullable: true })
  billing_details: BillingDetail;
}

@ObjectType()
export class ListPaymentMethodResponse {
  @Field(() => [PaymentMethod], { nullable: true })
  paymentMethods: PaymentMethod[];
  @Field({ nullable: true })
  defaultMethod?: string;
  @Field({ nullable: true })
  message?: string;
}
