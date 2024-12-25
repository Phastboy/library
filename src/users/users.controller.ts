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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/auth/role.guard';
import { Role } from 'src/types';
import { AuthGuard } from 'src/auth/auth.guard';
import { response } from 'src/utils/response.util';

@ApiCookieAuth('accessToken')
@ApiTags('users')
@Roles(Role.admin)
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
      const users = await this.usersService.findAll();
      return response.send({
        res,
        statusCode: 200,
        message: 'Users fetched successfully',
        data: { users },
      });
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
      const user = await this.usersService.find(UsersController, { id });
      if (!user) {
        throw new Error('User not found');
      }

      return response.send({
        res,
        statusCode: 200,
        message: 'User fetched successfully',
        data: { user },
      });
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

      return response.send({
        res,
        statusCode: 200,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      Logger.error(error.message, error.stack, UsersController.name);
      throw error;
    }
  }
}
