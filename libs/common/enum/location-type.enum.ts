import { registerEnumType } from '@nestjs/graphql';

export enum LocationType {
  Point = 'Point',
  Address = 'Address',
  Geohash = 'Geohash',
}

registerEnumType(LocationType, {
  name: 'LocationType',
});
