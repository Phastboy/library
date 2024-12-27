import { IsString, IsInt, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    maxLength: 255,
    example: 'The Great Gatsby',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'A brief description of the book',
    example: 'A novel about the American dream and societal excess.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The author of the book',
    maxLength: 255,
    example: 'F. Scott Fitzgerald',
  })
  @IsString()
  @MaxLength(255)
  author: string;

  @ApiProperty({
    description: 'The genre of the book',
    maxLength: 100,
    example: 'Fiction',
  })
  @IsString()
  @MaxLength(100)
  genre: string;

  @ApiProperty({
    description: 'The ISBN of the book',
    maxLength: 20,
    example: '978-0743273565',
  })
  @IsString()
  @MaxLength(20)
  ISBN: string;

  @ApiProperty({
    description: 'The total number of copies available',
    minimum: 1,
    example: 5,
  })
  @IsInt()
  @Min(1)
  totalCopies: number;
}
