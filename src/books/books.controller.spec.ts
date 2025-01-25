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
});
