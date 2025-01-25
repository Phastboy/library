import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from '../dto/book/create-book.dto';

describe('BooksService', () => {
    let service: BooksService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const prismaMock = {
            book: {
                create: jest.fn(),
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BooksService,
                { provide: PrismaService, useValue: prismaMock },
            ],
        }).compile();

        service = module.get<BooksService>(BooksService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('add', () => {
        it('should create a book with the given data', async () => {
            const createBookDto: CreateBookDto = {
                title: 'Test Book',
                author: 'Test Author',
                description: 'the description of the book',
                genre: 'Fiction',
                ISBN: '230-11111',
                totalCopies: 5,
            };

            const createdBook = {
                id: '12345',
                ...createBookDto,
                availableCopies: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prisma.book, 'create').mockResolvedValue(createdBook);

            const result = await service.add(createBookDto);

            expect(prisma.book.create).toHaveBeenCalledWith({
                data: {
                    ...createBookDto,
                    availableCopies: 5,
                },
            });
            expect(result).toEqual(createdBook);
        });
    });

    describe('findAll', () => {
        it('should fetch all books from the database', async () => {
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

            jest.spyOn(prisma.book, 'findMany').mockResolvedValue(books);

            const result = await service.findAll();

            expect(prisma.book.findMany).toHaveBeenCalled();
            expect(result).toEqual(books);
        });
    });
});
