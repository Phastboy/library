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

    async findAll() {
        return this.prisma.book.findMany();
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

    async update(id: string, updateBookDto: UpdateBookDto) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found`);
        }
        return this.prisma.book.update({
            where: { id },
            data: updateBookDto,
        });
    }

    async remove(id: string) {
        return this.prisma.book.delete({
            where: { id },
        });
    }
}
