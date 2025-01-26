import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from '../dto/book/create-book.dto';
import { UpdateBookDto } from '../dto/book/update-book.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BooksService {
    constructor(private readonly prisma: PrismaService) {}

    async add(data: CreateBookDto) {
        return this.prisma.book.create({
            data: {
                ...data,
                availableCopies: data.totalCopies,
            },
        });
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const take = limit;

        return this.prisma.book.findMany({
            skip,
            take,
        });
    }

    async findOne(id: string) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return book;
    }

    update(id: string, updateBookDto: UpdateBookDto) {
        return `This action updates a #${id} book`;
    }

    async remove(id: string) {
        return this.prisma.book.delete({
            where: { id },
        });
    }
}
