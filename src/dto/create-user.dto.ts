import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string
  @IsOptional()
  description: string
  @IsNotEmpty()
  mbti: string
  @IsNotEmpty()
  enneagram: string
  @IsNotEmpty()
  variant: string
  @IsNumber()
  @Type(() => Number)
  tritype: number
  @IsNotEmpty()
  socionics: string
  @IsNotEmpty()
  sloan: string
  @IsNotEmpty()
  psyche: string
}
