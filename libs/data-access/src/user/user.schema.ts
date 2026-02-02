import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserStatus } from '@app/common/enum/user-status.enum';
import { PhoneContactType } from './update-phone.schema';

import mongoose, { Document } from 'mongoose';
import { LocationType } from '@app/common/enum/location-type.enum';
import { LoginFlowType } from '@app/common/enum/login-flow-type.enum';

enum AuthProviderType {
  email = 'email',
  facebook = 'facebook',
  tiktok = 'tiktok',
  google = 'google',
  apple = 'apple',
  twitter = 'twitter',
}

class Location {
  type: LocationType;
  coordinates?: [number];
  country?: string;
  state?: string;
  city?: string;
  street?: string;
  postalCode?: string;
}

class ContactNumber {
  type: PhoneContactType;
  dialCode?: string;
  number: string;
  isVerified?: boolean;
}

class EmailDetails {
  email: string;
  isVerified: boolean;
}

class Contacts {
  phone?: ContactNumber;
  emailDetail?: EmailDetails;
}

export class Address {
  displayAddress: string;
  location: Location;
}

@Schema({ timestamps: true, autoIndex: true })
export class User {
  @Prop({ required: true })
  authProvider: AuthProviderType;

  @Prop({ unique: true, required: true })
  authProviderId: string;

  @Prop()
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  profileImage: string;

  @Prop({ type: Address })
  address: Address;

  @Prop({
    type: String,
    default: UserStatus.email_verification_pending,
  })
  status: UserStatus;

  @Prop({ type: String, default: LoginFlowType.otp })
  loginFlowType: LoginFlowType;

  @Prop()
  contacts: Contacts;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: null })
  lastLoggedInAt: Date;

  @Prop({ default: false })
  isTermsVersionSynced: boolean;

  @Prop()
  acceptedTermsVersion: string; // accepted terms and condition version, eg: v1

  // @Prop({ type: CurrentSubscription })
  // currentSubscription?: CurrentSubscription;

  @Prop()
  isBiometricEnabled?: boolean;

  @Prop()
  stripeSubscriptionEndsAt?: Date;

  @Prop()
  lastPayoutAt: Date; // note: this should be at the schema of service or product owner, it's in the user schema for now

  @Prop()
  agoraUuid: string;

  @Prop({ default: false })
  rapidIdVerified: boolean;

  @Prop({ default: null })
  rapidIdDocumentType: string;

  @Prop({ required: false })
  stripeCustomerId?: string;

  @Prop({ required: false })
  defaultPaymentMethod?: string;

  @Prop({
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  })
  businessId: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Role',
    required: false,
  })
  roles: string[];

  @Prop({ default: 0 })
  invalidLoginCount: number;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { authProviderId: 1, authProvider: 1, deletedAt: 1 },
  { name: 'users_auth_provider', background: true },
);

UserSchema.index(
  { firstName: 'text', lastName: 'text' },
  { name: 'users_name_search', background: true },
);

UserSchema.index({ status: 1, deletedAt: 1 }, { name: 'users_status_deleted', background: true });
