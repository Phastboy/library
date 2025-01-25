import { Injectable } from '@nestjs/common';
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

    findOne(id: string) {
        return `This action returns a #${id} book`;
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
