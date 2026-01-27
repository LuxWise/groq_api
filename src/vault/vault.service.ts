import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import  vaultFactory  from 'node-vault';
import path from 'path/win32';

@Injectable()
export class VaultService {
    private client: ReturnType<typeof vaultFactory>;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.client = vaultFactory({
            endpoint: this.configService.get<string>('VAULT_ADDR'),
            token: this.configService.get<string>('VAULT_TOKEN'),
        })
    }

    private async getKV(mount: string, path: string) {
        const res = await this.client.read(`${mount}/data/${path}`);
        return res.data.data;
    }

    // JWT Secrets
    private async getJWTSecret() {
        const mount = this.configService.get<string>('VAULT_KV_MOUNT', 'secret');
        const path = this.configService.get<string>('VAULT_JWT_GROQ_API_PATH');

        if (!path) throw new Error('VAULT data  is not defined in configuration');
        return this.getKV(mount, path);
    }

    async getPublicKey(): Promise<string> {
        const secretData = await this.getJWTSecret();
        return secretData?.public_key;
    }

    async getJwtIssuer(): Promise<string> {
        const secretData = await this.getJWTSecret();
        return secretData?.issuer;
    }

    async getJwtAudience(): Promise<string> {
        const secretData = await this.getJWTSecret();
        return secretData?.audience;
    }

    // API Secrets
    private async getGroqSecret() {
        const mount = this.configService.get<string>('VAULT_KV_MOUNT', 'secret');
        const path = this.configService.get<string>('VAULT_GROQ_API_PATH');

        if (!path) throw new Error('VAULT data is not defined in configuration');
        return this.getKV(mount, path);
    }

    async getApiKey(): Promise<string> {
        const secretData = await this.getGroqSecret();
        return secretData?.api_key;
    }

    async getEncryptionKey(): Promise<string> {
        const secretData = await this.getGroqSecret();
        return secretData?.encryption_key;
    }

    async getGroqApiKey(): Promise<string> {
        const secretData = await this.getGroqSecret();
        return secretData?.groq_api_key;
    }

    async getIaModel(): Promise<string> {
        const secretData = await this.getGroqSecret();
        return secretData?.ia_model;
    }

    async getGroqApiJwtSecret(): Promise<string> {
        const secretData = await this.getGroqSecret();
        return secretData?.jwt_secret_key;
    }
}
