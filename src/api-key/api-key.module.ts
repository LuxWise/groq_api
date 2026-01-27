import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { EncryptModule } from '../encrypt/encrypt.module';
import { JwtModule } from '@nestjs/jwt';
import { VaultModule } from '../vault/vault.module';

@Module({
  imports: [
    EncryptModule,
    PersistenceModule,
    JwtModule,
    VaultModule
  ],
  providers: [ApiKeyService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService],
})
export class ApiKeyModule { }
