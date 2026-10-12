import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MatchesService', () => {
  let service: MatchesService;
  let prisma: PrismaService;

  const mockPrisma = {
    match: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all matches when no search query provided', async () => {
      const mockMatches = [{ id: 1 }, { id: 2 }];
      mockPrisma.match.findMany.mockResolvedValue(mockMatches);

      const result = await service.findAll();
      expect(result).toEqual(mockMatches);
      expect(mockPrisma.match.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
      });
    });

    it('should filter matches by search query', async () => {
      const mockMatches = [{ id: 1 }];
      mockPrisma.match.findMany.mockResolvedValue(mockMatches);

      const result = await service.findAll('India');
      expect(result).toEqual(mockMatches);
      expect(mockPrisma.match.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { homeTeam: { name: { contains: 'India', mode: 'insensitive' } } },
            { awayTeam: { name: { contains: 'India', mode: 'insensitive' } } },
          ],
        },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return match details by id', async () => {
      const mockMatch = { id: 1, homeTeamId: 1, awayTeamId: 2 };
      mockPrisma.match.findUnique.mockResolvedValue(mockMatch);

      const result = await service.findOne(1);
      expect(result).toEqual(mockMatch);
      expect(mockPrisma.match.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if match does not exist', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
