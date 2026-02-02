import { registerEnumType } from '@nestjs/graphql';

export enum SignedUrlMethod {
  PUT = 'PUT',
  GET = 'GET',
}

registerEnumType(SignedUrlMethod, {
  name: 'SignedUrlMethod',
});
