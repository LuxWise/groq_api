import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { EncryptPasswordUtil } from './utils/encrypt-password.util';
import { JwtModule } from '@nestjs/jwt';
import { VaultModule } from '../vault/vault.module';
import { ApiKeyModule } from '../api-key/api-key.module';

@Module({
  imports: [
    PersistenceModule,
    JwtModule,
    VaultModule,
    ApiKeyModule
  ],
  providers: [EncryptPasswordUtil, UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
