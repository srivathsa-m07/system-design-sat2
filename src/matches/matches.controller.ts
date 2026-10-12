import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { MatchQueryDto } from './dto/match-query.dto';
import { MatchResponseDto } from './dto/match-response.dto';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all matches with optional team name search' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter matches by team name',
  })
  @ApiResponse({
    status: 200,
    description: 'List of matches retrieved successfully',
    type: [MatchResponseDto],
  })
  async findAll(@Query() query: MatchQueryDto) {
    return this.matchesService.findAll(query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match by ID with score and events' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique match ID (positive integer)',
  })
  @ApiResponse({
    status: 200,
    description: 'Match found successfully',
    type: MatchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Match not found',
  })
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.matchesService.findOne(parsedId);
  }
}
