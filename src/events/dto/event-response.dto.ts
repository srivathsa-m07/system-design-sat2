import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  matchId: number;

  @ApiProperty({ example: 'GOAL', enum: ['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'HALF_TIME', 'FULL_TIME'] })
  type: string;

  @ApiProperty({ example: 15 })
  minute: number;

  @ApiProperty({ example: 'Virat Kohli', nullable: true })
  player: string | null;

  @ApiProperty({ example: 'Header from corner', nullable: true })
  detail: string | null;

  @ApiProperty()
  createdAt: Date;
}
