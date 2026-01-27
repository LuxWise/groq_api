import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'crypto';
import { PersistenceService } from '../persistence/persistence.service';
import { InputCreateApiKey } from './types/input-create-api-key.types';
import { InputRevokeApiKey } from './types/input-revoke-api-key.types';
import { EncryptService } from '../encrypt/encrypt.service';
import { VaultService } from '../vault/vault.service';

@Injectable()
export class ApiKeyService {
    constructor(
        private readonly vaultService: VaultService,
        private readonly persistence: PersistenceService,
        private readonly encryptService: EncryptService
    ) { }

    private async getApiKey(): Promise<string> {
        const apiKey = await this.vaultService.getApiKey();
        if (!apiKey) {
            throw new Error('API key not found in configuration');
        }
        return apiKey;
    }

    private async hashKey(key: string): Promise<string> {
        const apiKey = await this.getApiKey();
        return createHmac('sha256', apiKey).update(key).digest('hex');
    }

    private newAPIKey(): string {
        const raw = randomBytes(32).toString('base64url');
        return `ak_${raw}`;
    }

    async createKey(input: InputCreateApiKey): Promise<string> {
        const apiKey = this.newAPIKey();
        const hashedKey = await this.hashKey(apiKey);

        const createdKey = await this.persistence.api_keys.create({
            data: {
                userId: input.userId,
                apiKey: hashedKey,
                expiresAt: input.expiresAt || null
            }
        })

        if (!createdKey) {
            throw new Error('Failed to create API key');
        }

        const encryptKey = this.encryptService.encrypt(apiKey);
        return encryptKey;
    }

    async validateKey(apiKey: string): Promise<boolean> {
        if (!apiKey || !apiKey.startsWith('ak_')) throw new Error('Invalid API key');
    
        const hash = await this.hashKey(apiKey);
        const storedKey = await this.persistence.api_keys.findUnique({
            where: { apiKey: hash }
        });

        if (!storedKey) throw new Error('API key not found');
        if (storedKey.revoked) throw new Error('API key is revoked');
        if (storedKey.expiresAt && storedKey.expiresAt < new Date()) {
            throw new Error('API key has expired');
        }
        
        await this.persistence.api_keys.update({
            where: { id: storedKey.id },
            data: { lastUsedAt: new Date() }
        })

        return true;
    }

    async revokeKey(input: InputRevokeApiKey){
        const hashKey = await this.hashKey(input.apiKey);
        const storedKey = await this.persistence.api_keys.findUnique({
            where: { apiKey: hashKey }
        });

        if (!storedKey) {
            throw new Error('API key not found');
        }

        await this.persistence.api_keys.update({
            where: { id: storedKey.id },
            data: { revoked: true }
        });
    }
}
