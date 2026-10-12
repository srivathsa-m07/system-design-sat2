import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MatchQueryDto {
  @ApiPropertyOptional({
    description: 'Filter matches by team name (case-insensitive search)',
    example: 'Arsenal',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
