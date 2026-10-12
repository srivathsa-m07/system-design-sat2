import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  const mockPrisma = {
    match: {
      findUnique: jest.fn(),
    },
    matchEvent: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByMatchId', () => {
    it('should return events for existing match', async () => {
      mockPrisma.match.findUnique.mockResolvedValue({ id: 1 });
      const mockEvents = [
        { id: 1, matchId: 1, type: 'GOAL', minute: 15, player: 'Virat Kohli' },
      ];
      mockPrisma.matchEvent.findMany.mockResolvedValue(mockEvents);

      const result = await service.findByMatchId(1);
      expect(result).toEqual(mockEvents);
      expect(mockPrisma.matchEvent.findMany).toHaveBeenCalledWith({
        where: { matchId: 1 },
        orderBy: { minute: 'asc' },
      });
    });

    it('should throw NotFoundException if match not found', async () => {
      mockPrisma.match.findUnique.mockResolvedValue(null);

      await expect(service.findByMatchId(999)).rejects.toThrow(NotFoundException);
    });
  });
});
