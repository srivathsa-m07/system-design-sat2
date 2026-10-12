import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { ScoresGateway } from './scores.gateway';

@Module({
  controllers: [ScoresController],
  providers: [ScoresService, ScoresGateway],
  exports: [ScoresService, ScoresGateway],
})
export class ScoresModule {}
