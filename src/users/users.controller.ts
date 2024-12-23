import {
  Controller,
  Get,
  Logger,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/auth/role.guard';
import { Role } from 'src/types';
import { AuthGuard } from 'src/auth/auth.guard';
import { response } from 'src/utils/response.util';

@ApiTags('users')
@Roles(Role.ADMIN)
@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll(@Res() res: any) {
    Logger.log('Finding all users...', UsersController.name);
    try {
      const data = await this.usersService.findAll();
      return response(res, 200, 'Users fetched successfully', data);
    } catch (error: any) {
      Logger.error(error.message, error.stack, UsersController.name);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User fetched successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string, @Res() res: any) {
    Logger.log(`Finding user with id ${id}`, UsersController.name);
    try {
      const data = await this.usersService.find(UsersController, { id });
      if (!data) {
        throw new Error('User not found');
      }

      return response(res, 200, 'User fetched successfully', data);
    } catch (error: any) {
      Logger.error(error.message, error.stack, UsersController.name);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteUser(@Param('id') id: string, @Res() res: any) {
    Logger.log(`Deleting user with id ${id}`, UsersController.name);
    try {
      const result = await this.usersService.delete(id);
      if (!result) {
        throw new Error('User not found');
      }

      return response(res, 200, 'User deleted successfully');
    } catch (error: any) {
      Logger.error(error.message, error.stack, UsersController.name);
      throw error;
    }
  }
}
