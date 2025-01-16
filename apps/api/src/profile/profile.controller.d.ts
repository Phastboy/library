import { ProfileService } from './profile.service';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { AuthService } from 'src/auth/auth.service';
export declare class ProfileController {
    private readonly profileService;
    private authService;
    constructor(profileService: ProfileService, authService: AuthService);
    getProfile(req: any, res: any): Promise<any>;
    updateProfile(req: any, updateUserDto: UpdateUserDto, res: any): Promise<any>;
    deleteProfile(req: any, res: any): Promise<any>;
}
