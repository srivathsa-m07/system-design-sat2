import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier of the team' })
  id: number;

  @ApiProperty({ example: 'Arsenal', description: 'Name of the team' })
  name: string;

  @ApiProperty({ example: 'England', description: 'Country of the team' })
  country: string;

  @ApiPropertyOptional({ example: 'ARS', description: 'Team short code' })
  shortCode?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    nullable: true,
    description: 'Logo URL of the team',
  })
  logoUrl: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Team creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Team last update timestamp' })
  updatedAt: Date;
}
