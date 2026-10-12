import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ScoresGateway } from './scores.gateway';

@Injectable()
export class ScoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoresGateway: ScoresGateway,
  ) {}

  async findByMatchId(matchId: number) {
    // Check if match exists
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const score = await this.prisma.score.findUnique({
      where: { matchId },
    });

    if (!score) {
      throw new NotFoundException('Score not found for this match');
    }

    return score;
  }

  async updateScore(matchId: number, updateScoreDto: UpdateScoreDto) {
    // Check if match exists
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Upsert score (create if doesn't exist, update if does)
    const score = await this.prisma.score.upsert({
      where: { matchId },
      update: {
        homeScore: updateScoreDto.homeScore,
        awayScore: updateScoreDto.awayScore,
      },
      create: {
        matchId,
        homeScore: updateScoreDto.homeScore,
        awayScore: updateScoreDto.awayScore,
      },
    });

    // Broadcast score update via WebSocket
    this.scoresGateway.broadcastScoreUpdate(matchId, score);

    return score;
  }
}
