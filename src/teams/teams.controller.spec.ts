import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeamsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        { provide: TeamsService, useValue: mockTeamsService },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a team by id', async () => {
      const mockTeam = { id: 1, name: 'India', country: 'India' };
      mockTeamsService.findOne.mockResolvedValue(mockTeam);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockTeam);
      expect(mockTeamsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if id is invalid', async () => {
      await expect(controller.findOne('invalid')).rejects.toThrow(BadRequestException);
      await expect(controller.findOne('0')).rejects.toThrow(BadRequestException);
      await expect(controller.findOne('-5')).rejects.toThrow(BadRequestException);
    });

    it('should rethrow NotFoundException if team not found', async () => {
      mockTeamsService.findOne.mockRejectedValue(new NotFoundException('Team not found'));

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
