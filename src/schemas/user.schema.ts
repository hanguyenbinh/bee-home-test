import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Connection, HydratedDocument, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    type: String, default: function genUUID() {
      return uuidv4()
    }
  })
  _id: string

  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  mbti: string;
  
  @Prop()
  enneagram: string;  

  @Prop()
  variant: string;

  @Prop()
  tritype: number;

  @Prop()
  socionics: string;

  @Prop()
  sloan: string;

  @Prop()
  psyche: string;

  @Prop()
  image: string;

  @Prop([{type: Types.ObjectId, ref: 'Comment'}])
  comments: Comment[];

}

export const UserSchema = SchemaFactory.createForClass(User);
export const UserProviders = [
  {
    provide: 'USER_MODEL',
    useFactory: (connection: Connection) => connection.model('User', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];