import { Module } from '@nestjs/common';
import { SenalesService } from './services/senales.service';
import { SenalesResolver } from './senales.resolver';

@Module({
  providers: [SenalesResolver, SenalesService],
})
export class SenalesModule {}