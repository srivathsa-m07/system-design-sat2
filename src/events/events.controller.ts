import {
  Controller,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('matches')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(':id/events')
  @ApiOperation({ summary: 'Get events for a match' })
  @ApiParam({ name: 'id', type: Number, description: 'Match ID' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  async getEvents(@Param('id') id: string) {
    const matchId = parseInt(id, 10);
    if (isNaN(matchId) || matchId < 1) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.eventsService.findByMatchId(matchId);
  }
}
