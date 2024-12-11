import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  create(createUserDto: CreateUserDto): CreateUserDto {
    return createUserDto;
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
