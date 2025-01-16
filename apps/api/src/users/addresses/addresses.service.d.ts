import { CreateAddressDto } from '../../dto/address/create-address.dto';
import { UpdateAddressDto } from '../../dto/address/update-address.dto';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class AddressesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, createAddressDto: CreateAddressDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateAddressDto: UpdateAddressDto): Promise<any>;
    remove(id: string): Promise<any>;
    addressForUser(userId: string): Promise<any>;
}
