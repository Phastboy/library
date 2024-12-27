import { IsString, IsInt, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @MaxLength(255)
  author: string;

  @IsString()
  @MaxLength(100)
  genre: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ISBN?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalCopies?: number;
}
