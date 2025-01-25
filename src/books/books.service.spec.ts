import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from '../dto/book/create-book.dto';
import { UpdateBookDto } from '../dto/book/update-book.dto';
import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
    let service: BooksService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const prismaMock = {
            book: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
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

            jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(book);

            const result = await service.findOne(bookId);

            expect(prisma.book.findUnique).toHaveBeenCalledWith({
                where: { id: bookId },
            });
            expect(result).toEqual(book);
        });

        it('should throw a NotFoundException if book is not found', async () => {
            const bookId = '1';

            jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(null);

            await expect(service.findOne(bookId)).rejects.toThrow(
                new NotFoundException(`Book with ID ${bookId} not found`),
            );
        });
    });

    describe('update', () => {
        it('should update a book with the given data', async () => {
            const bookId = '1';
            const updateBookDto: UpdateBookDto = {
                title: 'Updated Test Book',
                author: 'Updated Test Author',
                description: 'Updated Description',
                genre: 'Updated Genre',
                ISBN: '1234567890',
                totalCopies: 10,
            };

            const updatedBook = {
                id: bookId,
                ...updateBookDto,
                availableCopies: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(updatedBook);
            jest.spyOn(prisma.book, 'update').mockResolvedValue(updatedBook);

            const result = await service.update(bookId, updateBookDto);

            expect(prisma.book.findUnique).toHaveBeenCalledWith({
                where: { id: bookId },
            });
            expect(prisma.book.update).toHaveBeenCalledWith({
                where: { id: bookId },
                data: updateBookDto,
            });
            expect(result).toEqual(updatedBook);
        });

        it('should throw a NotFoundException if book is not found', async () => {
            const bookId = '1';
            const updateBookDto: UpdateBookDto = {
                title: 'Updated Test Book',
                author: 'Updated Test Author',
                description: 'Updated Description',
                genre: 'Updated Genre',
                ISBN: '1234567890',
                totalCopies: 10,
            };

            jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(null);

            await expect(service.update(bookId, updateBookDto)).rejects.toThrow(
                new NotFoundException(`Book with ID ${bookId} not found`),
            );
        });
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

            jest.spyOn(prisma.book, 'delete').mockResolvedValue(deletedBook);

            const result = await service.remove(bookId);

            expect(prisma.book.delete).toHaveBeenCalledWith({
                where: { id: bookId.toString() },
            });
            expect(result).toEqual(deletedBook);
        });
    });
});
