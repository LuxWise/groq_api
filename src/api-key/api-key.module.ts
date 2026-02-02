import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { EncryptModule } from '../encrypt/encrypt.module';
import { JwtModule } from '@nestjs/jwt';
import { VaultModule } from '../vault/vault.module';
import { LogsInterceptor } from '../shared/logs.interceptor';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    EncryptModule,
    PersistenceModule,
    JwtModule,
    VaultModule,
    LoggingModule
  ],
  providers: [ApiKeyService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService],
})
export class ApiKeyModule { }
