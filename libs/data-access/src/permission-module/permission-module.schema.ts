import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PermissionModuleDocument = PermissionModule & Document;
@Schema()
export class PermissionModule {
  @Prop()
  name: string;
}

export const PermissionModuleSchema = SchemaFactory.createForClass(PermissionModule);
