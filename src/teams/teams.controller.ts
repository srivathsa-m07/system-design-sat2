import {
  BadRequestException,
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { TeamResponseDto } from './dto/team-response.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID with match history' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique team ID (positive integer)',
  })
  @ApiResponse({
    status: 200,
    description: 'Team found successfully',
    type: TeamResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.teamsService.findOne(parsedId);
  }
}
