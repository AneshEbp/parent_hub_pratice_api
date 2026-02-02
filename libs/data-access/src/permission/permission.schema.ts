import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { PermissionModule } from '../permission-module/permission-module.schema';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true }) // Add timestamps here
export class Permission {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ ref: PermissionModule.name, type: mongoose.Schema.Types.ObjectId, required: false })
  permissionModuleId: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
