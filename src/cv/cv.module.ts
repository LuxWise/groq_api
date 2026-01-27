import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { VaultModule } from '../vault/vault.module';
import { ApiKeyModule } from '../api-key/api-key.module';
import { EncryptModule } from '../encrypt/encrypt.module';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    VaultModule,
    ApiKeyModule,
    EncryptModule
  ],
  providers: [CvService],
  controllers: [CvController]
})
export class CvModule {}
