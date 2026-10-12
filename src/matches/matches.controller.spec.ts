import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { BadRequestException } from '@nestjs/common';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  const mockMatchesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        { provide: MatchesService, useValue: mockMatchesService },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all matches', async () => {
      const mockList = [{ id: 1 }];
      mockMatchesService.findAll.mockResolvedValue(mockList);

      const result = await controller.findAll({});
      expect(result).toEqual(mockList);
      expect(mockMatchesService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should pass search filter to service', async () => {
      const mockList = [{ id: 1 }];
      mockMatchesService.findAll.mockResolvedValue(mockList);

      const result = await controller.findAll({ search: 'India' });
      expect(result).toEqual(mockList);
      expect(mockMatchesService.findAll).toHaveBeenCalledWith('India');
    });
  });

  describe('findOne', () => {
    it('should return a match by id', async () => {
      const mockMatch = { id: 1 };
      mockMatchesService.findOne.mockResolvedValue(mockMatch);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockMatch);
      expect(mockMatchesService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if id is invalid', async () => {
      await expect(controller.findOne('abc')).rejects.toThrow(BadRequestException);
      await expect(controller.findOne('0')).rejects.toThrow(BadRequestException);
    });
  });
});
