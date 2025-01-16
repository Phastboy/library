import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';

@Module({
    imports: [PrismaModule, TokenModule],
    controllers: [AddressesController],
    providers: [AddressesService, PrismaService, TokenService],
})
export class AddressesModule {}
