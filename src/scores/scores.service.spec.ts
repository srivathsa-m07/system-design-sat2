import { Test, TestingModule } from '@nestjs/testing';
import { ScoresService } from './scores.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScoresGateway } from './scores.gateway';
import { NotFoundException } from '@nestjs/common';

describe('ScoresService', () => {
  let service: ScoresService;
  let prisma: PrismaService;
  let gateway: ScoresGateway;

  const mockPrisma = {
    match: {
      findUnique: jest.fn(),
    },
    score: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockGateway = {
    broadcastScoreUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoresService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ScoresGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<ScoresService>(ScoresService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<ScoresGateway>(ScoresGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByMatchId', () => {
    it('should return score for existing match', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({ id: 1 });
      const mockScore = { id: 1, matchId: 1, homeScore: 2, awayScore: 1 };
      mockPrisma.score.findUnique.mockResolvedValue(mockScore);

      const result = await service.findByMatchId(1);
      expect(result).toEqual(mockScore);
    });

    it('should throw NotFoundException if match does not exist', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null);

      await expect(service.findByMatchId(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if score does not exist', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.score.findUnique.mockResolvedValue(null);

      await expect(service.findByMatchId(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateScore', () => {
    it('should upsert score and broadcast update via gateway', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({ id: 1 });
      const updatedScore = { id: 1, matchId: 1, homeScore: 3, awayScore: 2 };
      mockPrisma.score.upsert.mockResolvedValue(updatedScore);

      const result = await service.updateScore(1, { homeScore: 3, awayScore: 2 });
      expect(result).toEqual(updatedScore);
      expect(mockPrisma.score.upsert).toHaveBeenCalledWith({
        where: { matchId: 1 },
        update: { homeScore: 3, awayScore: 2 },
        create: { matchId: 1, homeScore: 3, awayScore: 2 },
      });
      expect(mockGateway.broadcastScoreUpdate).toHaveBeenCalledWith(1, updatedScore);
    });

    it('should throw NotFoundException if match does not exist on update', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null);

      await expect(service.updateScore(999, { homeScore: 1, awayScore: 0 })).rejects.toThrow(NotFoundException);
      expect(mockGateway.broadcastScoreUpdate).not.toHaveBeenCalled();
    });
  });
});
