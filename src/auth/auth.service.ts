import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  create(createUserDto: CreateUserDto) {
    Logger.log('registering user...', AuthService.name);
    return this.userService.create(createUserDto);
  }

  async verifyEmail(email: string, token: string) {
    Logger.log('Received request to verify email', AuthService.name);
    return {
      message: `This action verifies email`,
      details: `under development`,
    }
  }

  findAll() {
    return {
      message: `This action returns all auth`,
      details: `under development`,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return updateAuthDto;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
