import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { EncryptService } from '../encrypt/encrypt.service';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private readonly apiKeyService: ApiKeyService,
        private readonly encryptService: EncryptService,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const tokenHeader = request.headers['x-token-key'];

        if (!tokenHeader) {
            throw new HttpException('Authorization header missing', 401);
        }

        try {
            const decryptedToken = await this.encryptService.decrypt(tokenHeader);
            const validate = await this.apiKeyService.validateKey(decryptedToken);

            if (!validate) {
                throw new HttpException('Invalid API key', 401);
            }

            return true;
        } catch (error) {
            throw new HttpException('Unauthorized', 401);
        }
    }
}
