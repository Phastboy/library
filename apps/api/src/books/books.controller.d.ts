import { BooksService } from './books.service';
import { CreateBookDto } from '../dto/book/create-book.dto';
import { UpdateBookDto } from '../dto/book/update-book.dto';
export declare class BooksController {
    private readonly booksService;
    constructor(booksService: BooksService);
    add(createBookDto: CreateBookDto): Promise<{
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
    findOne(id: string): string;
    update(id: string, updateBookDto: UpdateBookDto): string;
    remove(id: string): string;
}
