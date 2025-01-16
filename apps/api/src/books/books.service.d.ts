import { CreateBookDto } from '../dto/book/create-book.dto';
import { UpdateBookDto } from '../dto/book/update-book.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class BooksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    add(data: CreateBookDto): Promise<{
        description: string;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        author: string;
        genre: string;
        ISBN: string;
        totalCopies: number;
        availableCopies: number;
    }>;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateBookDto: UpdateBookDto): string;
    remove(id: number): string;
}
