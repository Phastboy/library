import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { Profile } from 'src/types';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UsersService) {}

  async read(userId: string): Promise<Profile> {
    Logger.log('Received request to get profile', ProfileService.name);
      const user =
        await this.userService.find(ProfileService, { id: userId });
      if (!user) {
        Logger.error('User not found', ProfileService.name);
        throw new BadRequestException('User not found');
      }
      return this.userService.stripSensitiveFields(user);
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<Profile> {
    Logger.log('Received request to update profile', ProfileService.name);
    try {
      const user =
        await this.userService.update(userId, updateUserDto);
      return user;
    } catch (error: any) {
      Logger.error(error.message, error.stack, ProfileService.name);
      throw error;
    }
  }

  async delete(userId: string) {
    Logger.log('Received request to delete profile', ProfileService.name);
    try {
      const { id, refreshToken, password, ...profile } =
        await this.userService.delete(userId);
      Logger.log(
        `Profile deleted for user with id ${userId}`,
        ProfileService.name,
      );
      return profile;
    } catch (error: any) {
      Logger.error(error.message, error.stack, ProfileService.name);
      throw error;
    }
  }
}
