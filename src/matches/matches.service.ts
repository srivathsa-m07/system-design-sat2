import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string) {
    const where = search
      ? {
          OR: [
            {
              homeTeam: {
                name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            },
            {
              awayTeam: {
                name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : {};

    return this.prisma.match.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
        score: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        score: true,
        events: {
          orderBy: {
            minute: 'asc',
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }
}
