import {
  IsNotEmpty,
  IsUUID
} from 'class-validator';

export class CreateCommentDto {
  @IsUUID('4')
  userId: string // who post comment
  @IsNotEmpty()
  content: string
  @IsNotEmpty()
  mbti: string
  @IsNotEmpty()
  enneagram: string
  @IsNotEmpty()
  zodiac: string
}
