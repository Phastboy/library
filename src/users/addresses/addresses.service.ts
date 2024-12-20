import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from '../../dto/address/create-address.dto';
import { UpdateAddressDto } from '../../dto/address/update-address.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string,createAddressDto: CreateAddressDto) {
    return await this.prisma.address.create({
      data: {
        userId,
        apartmentNumber: createAddressDto.apartmentNumber,
        street: createAddressDto.street,
        city: createAddressDto.city,
        country: createAddressDto.country,
        postalCode: createAddressDto.postalCode,
      }
    });
  }

  async findAll() {
    return await this.prisma.address.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.address.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    return await this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.address.delete({
      where: { id },
    });
  }

  async addressForUser(userId: string) {
    return await this.prisma.address.findMany({
      where: { userId },
    });
  }
}
