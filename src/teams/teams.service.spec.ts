import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TeamsService', () => {
  let service: TeamsService;
  let prisma: PrismaService;

  const mockPrisma = {
    team: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a team if found', async () => {
      const mockTeam = {
        id: 1,
        name: 'India',
        country: 'India',
        logoUrl: 'https://example.com/india.png',
        homeMatches: [],
        awayMatches: [],
      };
      mockPrisma.team.findUnique.mockResolvedValue(mockTeam);

      const result = await service.findOne(1);
      expect(result).toEqual(mockTeam);
      expect(mockPrisma.team.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
