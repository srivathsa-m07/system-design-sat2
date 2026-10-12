import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamResponseDto } from '../../teams/dto/team-response.dto';

export class ScoreResponseDto {
  @ApiProperty({ example: 1, description: 'Score unique identifier' })
  id: number;

  @ApiProperty({ example: 1, description: 'Match identifier' })
  matchId: number;

  @ApiProperty({ example: 2, description: 'Home team score' })
  homeScore: number;

  @ApiProperty({ example: 1, description: 'Away team score' })
  awayScore: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Score creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Score last update timestamp' })
  updatedAt: Date;
}

export class MatchEventResponseDto {
  @ApiProperty({ example: 1, description: 'Event unique identifier' })
  id: number;

  @ApiProperty({ example: 1, description: 'Match identifier' })
  matchId: number;

  @ApiProperty({ example: 1, description: 'Team identifier' })
  teamId: number;

  @ApiProperty({ example: 'GOAL', description: 'Type of event (e.g. GOAL, YELLOW_CARD, RED_CARD)' })
  type: string;

  @ApiProperty({ example: 45, description: 'Minute in match when event occurred' })
  minute: number;

  @ApiProperty({ example: 'Bukayo Saka', description: 'Player involved in the event' })
  player: string;

  @ApiPropertyOptional({ example: 'Assist by Martin Odegaard', nullable: true, description: 'Additional event details' })
  detail?: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Event creation timestamp' })
  createdAt: Date;
}

export class MatchResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier of the match' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the home team' })
  homeTeamId: number;

  @ApiProperty({ example: 2, description: 'ID of the away team' })
  awayTeamId: number;

  @ApiProperty({ example: 'Emirates Stadium', description: 'Match venue' })
  venue: string;

  @ApiProperty({ example: '2026-01-01T15:00:00.000Z', description: 'Match start time' })
  startTime: Date;

  @ApiProperty({ example: 'SCHEDULED', description: 'Match status (e.g. SCHEDULED, LIVE, FINISHED)' })
  status: string;

  @ApiProperty({ type: () => TeamResponseDto, description: 'Home team details' })
  homeTeam: TeamResponseDto;

  @ApiProperty({ type: () => TeamResponseDto, description: 'Away team details' })
  awayTeam: TeamResponseDto;

  @ApiPropertyOptional({ type: () => ScoreResponseDto, nullable: true, description: 'Score details' })
  score?: ScoreResponseDto | null;

  @ApiPropertyOptional({ type: () => [MatchEventResponseDto], description: 'Match events list' })
  events?: MatchEventResponseDto[];
}
