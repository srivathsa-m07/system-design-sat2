import { Test, TestingModule } from '@nestjs/testing';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { BadRequestException } from '@nestjs/common';

describe('ScoresController', () => {
  let controller: ScoresController;
  let service: ScoresService;

  const mockScoresService = {
    findByMatchId: jest.fn(),
    updateScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoresController],
      providers: [
        { provide: ScoresService, useValue: mockScoresService },
      ],
    }).compile();

    controller = module.get<ScoresController>(ScoresController);
    service = module.get<ScoresService>(ScoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getScore', () => {
    it('should return score by matchId', async () => {
      const mockScore = { matchId: 1, homeScore: 2, awayScore: 1 };
      mockScoresService.findByMatchId.mockResolvedValue(mockScore);

      const result = await controller.getScore('1');
      expect(result).toEqual(mockScore);
      expect(mockScoresService.findByMatchId).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException on invalid id', async () => {
      await expect(controller.getScore('abc')).rejects.toThrow(BadRequestException);
      await expect(controller.getScore('-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateScore', () => {
    it('should update and return score', async () => {
      const mockScore = { matchId: 1, homeScore: 3, awayScore: 2 };
      mockScoresService.updateScore.mockResolvedValue(mockScore);

      const result = await controller.updateScore('1', { homeScore: 3, awayScore: 2 });
      expect(result).toEqual(mockScore);
      expect(mockScoresService.updateScore).toHaveBeenCalledWith(1, { homeScore: 3, awayScore: 2 });
    });

    it('should throw BadRequestException on invalid id', async () => {
      await expect(controller.updateScore('xyz', { homeScore: 1, awayScore: 0 })).rejects.toThrow(BadRequestException);
    });
  });
});
