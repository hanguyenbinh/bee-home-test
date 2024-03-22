import {
  IsUUID
} from 'class-validator';

export class CreateLikeDto {
  @IsUUID('4')
  userId: string // who add a like  
}
