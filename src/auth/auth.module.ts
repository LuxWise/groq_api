import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { CompareUtil } from './utils/compare.utils';
import { EncryptModule } from '../encrypt/encrypt.module';
import { ApiKeyModule } from '../api-key/api-key.module';
import { VaultModule } from '../vault/vault.module';
import { AuthGuardInternal } from './guard/auth-internal.guard';
import { AuthGuardExternal } from './guard/auth-external.guard';
import { LoggingModule } from '../logging/logging.module';

@Module({
    imports: [
        JwtModule,
        UsersModule,
        ApiKeyModule,
        EncryptModule,
        VaultModule,
        LoggingModule
    ],
    providers: [AuthGuardInternal, AuthGuardExternal, AuthService, CompareUtil],
    controllers: [AuthController],
    exports: [AuthGuardInternal, AuthGuardExternal],
})
export class AuthModule {}
