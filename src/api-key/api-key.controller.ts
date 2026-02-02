import { Body, Controller, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { InputCreateApiKey } from './types/input-create-api-key.types';
import { RevokeApiKeyDto } from './dto/revoke-api-key.dto';
import { InputRevokeApiKey } from './types/input-revoke-api-key.types';
import { AuthGuardInternal } from '../auth/guard/auth-internal.guard';
import { LogsInterceptor } from '../shared/logs.interceptor';

@UseInterceptors(LogsInterceptor)
@UseGuards(AuthGuardInternal)
@Controller('api-key')
export class ApiKeyController {
    constructor(
        private readonly apiKeyService: ApiKeyService,
    ) {}

    @Post('create')
    async createApiKey(@Req() req: Request, @Body() dto?: CreateApiKeyDto) {
        const user: any = (req as any).user;
        const userId = user.sub;

        const input: InputCreateApiKey = {
            userId: userId,
            expiresAt: dto?.expiresAt ?? null,
        }   
        const apiKey = await this.apiKeyService.createKey(input);

        return { apiKey };
    }

    @Post('revoke')
    async revokeApiKey(@Req() req: Request, @Body() dto: RevokeApiKeyDto) {
        const input: InputRevokeApiKey = {
            apiKey: dto.apiKey,
        }
        await this.apiKeyService.revokeKey(input);
    }
}
