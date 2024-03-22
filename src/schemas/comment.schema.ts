import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Connection, HydratedDocument, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: String, default: function genUUID() {
      return uuidv4()
    }
  })
  _id: string

  @Prop()
  userId: string;

  @Prop()
  content: string;

  @Prop()
  mbti: string;
  
  @Prop()
  enneagram: string;  

  @Prop()
  zodiac: string;

  @Prop([{type: mongoose.Schema.Types.String}])
  like: string[];
  @Prop()
  likeCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  profile: { type: Types.ObjectId; ref: 'User' };

  @Prop({type: mongoose.Schema.Types.Date})  
  createdAt?: Date

  @Prop({type: mongoose.Schema.Types.Date})  
  updatedAt?: Date
  
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
export const CommentProviders = [
  {
    provide: 'Comment_MODEL',
    useFactory: (connection: Connection) => connection.model('Comment', CommentSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];