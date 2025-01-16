import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(res: any): Promise<void>;
    findOne(id: string, res: any): Promise<void>;
    deleteUser(id: string, res: any): Promise<void>;
}
