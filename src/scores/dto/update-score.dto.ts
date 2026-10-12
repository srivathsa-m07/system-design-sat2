import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateScoreDto {
  @ApiProperty({ example: 2, description: 'Home team score' })
  @IsInt()
  @Min(0)
  homeScore: number;

  @ApiProperty({ example: 1, description: 'Away team score' })
  @IsInt()
  @Min(0)
  awayScore: number;
}
