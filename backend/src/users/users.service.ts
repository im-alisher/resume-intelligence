import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  create(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
  }) {
    return this.prisma.user.create({
      data,
      select: publicUserSelect,
    });
  }
}
