import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Logger } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from '../dto/profile/create-profile.dto';
import { UpdateProfileDto } from '../dto/profile/update-profile.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Post()
    @Get('/profile')
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async profile(@Req() req) {
      Logger.log('Received request to get profile', ProfileController.name);
      try {
        Logger.log(`Fetching profile for user with id ${req.user.id}`, ProfileController.name);
        if (!req.user.id) {
          Logger.error('User id is required', ProfileController.name);
          throw new Error('User id is required');
        }
        const profile = await this.profileService.profile(req.user.id);
        return profile;
      } catch (error: any) {
        Logger.error(error.message, error.stack, ProfileController.name);
        throw error;
      }
    }

    @Patch('update-profile')
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    async update(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
        Logger.log('Received request to update profile', ProfileController.name);
        try {
        Logger.log(`Updating profile for user with id ${req.user.id}`, ProfileController.name);
        if (!req.user.id) {
            Logger.error('User id is required', ProfileController.name);
            throw new Error('User id is required');
        }
            const updated = await this.profileService.updateProfile(req.user.id, updateUserDto);
            return updated;
        } catch (error: any) {
          Logger.error(error.message, error.stack, ProfileController.name);
            throw error;
        }
    }
}
