import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): any {
        return {
            title: 'Library',
            description:
                'A library management system where users can browse and borrow books, manage their accounts, and interact with library staff. The platform aims to provide a seamless experience for both library patrons and administrators.',
        };
    }
}
