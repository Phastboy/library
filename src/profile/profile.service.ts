import { Injectable, Logger } from '@nestjs/common';
import { UpdateProfileDto } from '../dto/profile/update-profile.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UsersService) {}

    async read(id: string) {
      Logger.log('Received request to get profile', ProfileService.name);
      try {
        const profile = await this.userService.find(ProfileService, { id });
        return {
          message: 'Profile retrieved successfully',
          data: profile,
        }
      } catch (error: any) {
        Logger.error(error.message, error.stack, ProfileService.name);
        throw error;
      }
    }
    
    async update(id: string, updateUserDto: UpdateUserDto) {
        Logger.log('Received request to update profile', ProfileService.name);
        try {
          const profile = await this.userService.update(id, updateUserDto);
          return {
            message: 'Profile updated successfully',
            data: profile,
          }
        } catch (error: any) {
          Logger.error(error.message, error.stack, ProfileService.name);
          throw error;
        }
    }

    async delete(id: string) {
      Logger.log('Received request to delete profile', ProfileService.name);
      try {
        const profile = await this.userService.delete(id);
        return {
          message: 'Profile deleted successfully',
          data: profile,
        }
      } catch (error: any) {
        Logger.error(error.message, error.stack, ProfileService.name);
        throw error;
      }
    }
}
