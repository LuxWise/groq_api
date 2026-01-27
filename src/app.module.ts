import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CvModule } from './cv/cv.module';
import { FormatsModule } from './formats/formats.module';
import { EncryptModule } from './encrypt/encrypt.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { VaultModule } from './vault/vault.module';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: `.env`,
    }),
    HealthModule,
    PersistenceModule, 
    UsersModule, 
    AuthModule, 
    CvModule, 
    FormatsModule, EncryptModule, ApiKeyModule, VaultModule
  ],
})
export class AppModule {}
