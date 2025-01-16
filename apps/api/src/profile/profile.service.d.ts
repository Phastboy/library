import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { Profile } from 'src/types';
export declare class ProfileService {
    private readonly userService;
    constructor(userService: UsersService);
    read(userId: string): Promise<Profile>;
    update(userId: string, updateUserDto: UpdateUserDto): Promise<Profile>;
    delete(userId: string): Promise<{
        email: string;
        username: string;
        role: import(".prisma/client").$Enums.Role;
        phoneNumber: string | null;
        emailIsVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
