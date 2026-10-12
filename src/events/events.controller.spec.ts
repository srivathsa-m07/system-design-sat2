import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { BadRequestException } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEventsService = {
    findByMatchId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEvents', () => {
    it('should return events for match', async () => {
      const mockEvents = [{ id: 1, type: 'GOAL' }];
      mockEventsService.findByMatchId.mockResolvedValue(mockEvents);

      const result = await controller.getEvents('1');
      expect(result).toEqual(mockEvents);
      expect(mockEventsService.findByMatchId).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException on invalid id', async () => {
      await expect(controller.getEvents('abc')).rejects.toThrow(BadRequestException);
      await expect(controller.getEvents('0')).rejects.toThrow(BadRequestException);
    });
  });
});
