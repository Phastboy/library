import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { Profile } from 'src/types';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UsersService) {}

  async read(userId: string): Promise<Profile> {
    Logger.log('Received request to get profile', ProfileService.name);
    try {
      const { id, refreshToken, password, ...profile } =
        await this.userService.find(ProfileService, { id: userId });
      return profile;
    } catch (error: any) {
      Logger.error(error.message, error.stack, ProfileService.name);
      throw error;
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<Profile> {
    Logger.log('Received request to update profile', ProfileService.name);
    try {
      const { id, refreshToken, password, ...profile } =
        await this.userService.find(ProfileService, { id: userId });
      return profile;
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
