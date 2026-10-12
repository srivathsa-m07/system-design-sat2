import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMatchId(matchId: number) {
    // Check if match exists
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const events = await this.prisma.matchEvent.findMany({
      where: { matchId },
      orderBy: { minute: 'asc' },
    });

    return events;
  }
}
