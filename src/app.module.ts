import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { User, UserSchema } from './schemas/user.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
          mongoUri = configService.get('mongodb.uri');
        }
        return {
          uri: mongoUri,
        }
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema }
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
