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
});
  
