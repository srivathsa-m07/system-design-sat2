import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        homeMatches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            score: true,
          },
        },
        awayMatches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            score: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }
}
