import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
