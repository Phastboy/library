import { Injectable, Logger } from '@nestjs/common';
import { UpdateProfileDto } from '../dto/profile/update-profile.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UsersService) {}

    async profile(id: string) {
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
    
    async updateProfile(id: string, updateUserDto: UpdateUserDto) {
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
}
