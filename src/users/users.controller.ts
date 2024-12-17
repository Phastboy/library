import { Controller, Get, Logger, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    async findAll() {
        Logger.log('Finding all users...', UsersController.name);
        try {
            const data = await this.usersService.findAll();
            return {
                message: 'Users fetched successfully',
                data,
            }
        } catch (error: any) {
            Logger.error(error.message, error.stack, UsersController.name);
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        Logger.log(`Finding user with id ${id}`, UsersController.name);
        try {
            const data = await this.usersService.userExists(id, UsersController);
            return {
                message: 'User fetched successfully',
                data,
            }
        } catch (error: any) {
            Logger.error(error.message, error.stack, UsersController.name);
            throw error;
        }
    }
}
