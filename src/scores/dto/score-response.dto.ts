import { ApiProperty } from '@nestjs/swagger';

export class ScoreResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  matchId: number;

  @ApiProperty({ example: 2 })
  homeScore: number;

  @ApiProperty({ example: 1 })
  awayScore: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
