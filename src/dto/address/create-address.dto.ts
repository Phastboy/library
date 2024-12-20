import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({
    description: 'Apartment number of the address',
    example: 'Apt 101',
  })
  @IsString()
  @IsOptional()
  apartmentNumber?: string;

  @ApiProperty({
    description: 'Street of the address',
    example: '123 Main St',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    description: 'City of the address',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({
    description: 'State of the address',
    example: 'NY',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: 'Country of the address',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({
    description: 'Postal code of the address',
    example: '10001',
  })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Latitude of the address',
    example: 40.7128,
  })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude of the address',
    example: -74.006,
  })
  @IsLongitude()
  @IsOptional()
  longitude?: number;
}
