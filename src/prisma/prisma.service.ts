import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // Handle connection initialization
  async onModuleInit() {
    await this.$connect();
  }

  // Handle connection cleanup on application shutdown
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
