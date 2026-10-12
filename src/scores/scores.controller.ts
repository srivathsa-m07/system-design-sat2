import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ScoresService } from './scores.service';
import { UpdateScoreDto } from './dto/update-score.dto';

@ApiTags('Scores')
@Controller('matches')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Get(':id/score')
  @ApiOperation({ summary: 'Get score for a match' })
  @ApiParam({ name: 'id', type: Number, description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Score retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Match or score not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  async getScore(@Param('id') id: string) {
    const matchId = parseInt(id, 10);
    if (isNaN(matchId) || matchId < 1) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.scoresService.findByMatchId(matchId);
  }

  @Patch(':id/score')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update score for a match (simulate live update)' })
  @ApiParam({ name: 'id', type: Number, description: 'Match ID' })
  @ApiBody({ type: UpdateScoreDto })
  @ApiResponse({ status: 200, description: 'Score updated successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async updateScore(
    @Param('id') id: string,
    @Body() updateScoreDto: UpdateScoreDto,
  ) {
    const matchId = parseInt(id, 10);
    if (isNaN(matchId) || matchId < 1) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.scoresService.updateScore(matchId, updateScoreDto);
  }
}
