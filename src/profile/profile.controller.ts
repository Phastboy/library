import { Controller, Get, Body, Patch, Delete, Req, Logger, UseGuards, Res } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('profile')
@UseGuards(AuthGuard)
@Controller()
export class ProfileController {
    constructor(private readonly profileService: ProfileService, private authService: AuthService) {}

    @Get('/profile')
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async profile(@Req() req: any) {
      Logger.log('Received request to get profile', ProfileController.name);
      try {
        Logger.log(req.userId, ProfileController.name);
        Logger.log(`Fetching profile for user with id ${req.userId}`, ProfileController.name);
        if (!req.userId) {
          Logger.error('User id is required', ProfileController.name);
          throw new Error('User id is required');
        }
        const profile = await this.profileService.read(req.userId);
        return {
          message: 'Profile fetched successfully',
          data: profile,
        }
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
        Logger.log(`Updating profile for user with id ${req.userId}`, ProfileController.name);
        if (!req.userId) {
            Logger.error('User id is required', ProfileController.name);
            throw new Error('User id is required');
        }
            const id= req.userId;
            const updated = await this.profileService.update(id, updateUserDto);
            return {
                message: 'Profile updated successfully',
                data: updated,
            }
        } catch (error: any) {
          Logger.error(error.message, error.stack, ProfileController.name);
            throw error;
        }
    }

    @Delete('delete-profile')
    async delete(@Req() req: any, @Res() res: any) { 
      const id=req.userId;
      const deleted = await this.profileService.delete(id);
      // clear cookies
      await res.clearCookie('accessToken', this.authService.cookieOptions);
      await res.clearCookie('refreshToken', this.authService.cookieOptions);
      Logger.log(`Profile deleted for user with id ${id}`, ProfileController.name);
      return res.json({
        message: 'Profile deleted successfully',
        data: deleted,
      });
    }
}
