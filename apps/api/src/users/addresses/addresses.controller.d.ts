import { AddressesService } from './addresses.service';
import { CreateAddressDto } from '../../dto/address/create-address.dto';
import { UpdateAddressDto } from '../../dto/address/update-address.dto';
export declare class AddressesController {
    private readonly addressesService;
    constructor(addressesService: AddressesService);
    create(req: any, createAddressDto: CreateAddressDto): Promise<any>;
    findAll(): Promise<any>;
    myAddress(req: any): Promise<any>;
    findOne(req: any, id: string): Promise<any>;
    update(req: any, id: string, updateAddressDto: UpdateAddressDto): Promise<any>;
    remove(req: any, id: string): Promise<any>;
}
