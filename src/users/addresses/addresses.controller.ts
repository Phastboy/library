import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from '../../dto/address/create-address.dto';
import { UpdateAddressDto } from '../../dto/address/update-address.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@ApiTags('addresses')
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Req() req: any, @Body() createAddressDto: CreateAddressDto) {
    const { userId } = await req;
    return await this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({ status: 200, description: 'Addresses fetched successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll() {
    return await this.addressesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    const { userId } = await req;
    return await this.addressesService.findOne(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address updated successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async  update(@Req() req: any, @Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    const { userId } = await req;
    return await this.addressesService.update(userId, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address by ID' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(@Req() req: any, @Param('id') id: string) {
    const { userId } = await req;
    return await this.addressesService.remove(userId);
  }
}
