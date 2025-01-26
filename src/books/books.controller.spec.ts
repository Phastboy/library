import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BooksController', () => {
    let controller: BooksController;
    let service: BooksService;

    beforeEach(async () => {
        const prismaMock = {
            book: {
                create: jest.fn(),
                delete: jest.fn(),
                findUnique: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BooksController],
            providers: [
                BooksService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        controller = module.get<BooksController>(BooksController);
        service = module.get<BooksService>(BooksService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('remove', () => {
        it('should delete a book by ID', async () => {
            const bookId = '1';
            const deletedBook = {
                id: bookId,
                title: 'Test Book',
                author: 'Test Author',
                description: 'Test Description',
                genre: 'Test Genre',
                ISBN: '1234567890',
                totalCopies: 5,
                availableCopies: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'remove').mockResolvedValue(deletedBook);

            const result = await controller.remove(bookId);

            expect(service.remove).toHaveBeenCalledWith(bookId);
            expect(result).toEqual(deletedBook);
        });
    });

    describe('findOne', () => {
        it('should fetch a book by ID', async () => {
            const bookId = '1';
            const book = {
                id: bookId,
                title: 'Test Book',
                author: 'Test Author',
                description: 'Test Description',
                genre: 'Test Genre',
                ISBN: '1234567890',
                totalCopies: 5,
                availableCopies: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(service, 'findOne').mockResolvedValue(book);

            const result = await controller.findOne(bookId);

            expect(service.findOne).toHaveBeenCalledWith(bookId);
            expect(result).toEqual(book);
        });
    });

    describe('findAll', () => {
        it('should fetch paginated books from the database', async () => {
            const books = [
                {
                    id: '1',
                    title: 'Book 1',
                    author: 'Author 1',
                    description: 'Description 1',
                    genre: 'Genre 1',
                    ISBN: 'ISBN1',
                    totalCopies: 5,
                    availableCopies: 5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '2',
                    title: 'Book 2',
                    author: 'Author 2',
                    description: 'Description 2',
                    genre: 'Genre 2',
                    ISBN: 'ISBN2',
                    totalCopies: 3,
                    availableCopies: 3,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            jest.spyOn(service, 'findAll').mockResolvedValue(books);

            const page = 1;
            const limit = 2;
            const result = await controller.findAll(page, limit);

            expect(service.findAll).toHaveBeenCalledWith(page, limit);
            expect(result).toEqual(books);
        });
    });
});
