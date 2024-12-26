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
  NotFoundException,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from '../../dto/address/create-address.dto';
import { UpdateAddressDto } from '../../dto/address/update-address.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiCookieAuth('accessToken')
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

  @Get('my-address')
  @ApiOperation({ summary: 'Get address for user' })
  @ApiResponse({ status: 200, description: 'Address fetched successfully.' })
  async myAddress(@Req() req: any) {
    Logger.log('User ID: ' + req.userId);
    const { userId } = req;
    const myAddress = await this.addressesService.addressForUser(userId);
    if (myAddress) {
      return myAddress;
    }
    throw new NotFoundException('This user does not have an address');
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
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
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
