import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { VaultService } from '../vault/vault.service';

@Injectable()
export class EncryptService {
    constructor(
        private readonly vaultService: VaultService
    ) { }

    private async getKey(): Promise<Buffer> {
        const key = await this.vaultService.getEncryptionKey();
        if (!key) {
            throw new Error('Encryption key not found in configuration');
        }
        return Buffer.from(key, 'hex');
    }

    async encrypt(data: string): Promise<string> {
        try{
            const key = await this.getKey();
            const iv = randomBytes(16);
            const cipher = createCipheriv('aes-256-gcm', key, iv);

            const cipherText = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
            const authTag = cipher.getAuthTag();

            return `${iv.toString('hex')}:${authTag.toString('hex')}:${cipherText.toString('hex')}`;
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    async decrypt(encryptedData: string): Promise<string> {
        try{
            const [ivHex, tagHex, cipherHex] = encryptedData.split(':');
            
            const key = await this.getKey();
            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(tagHex, 'hex');
            const cipherText = Buffer.from(cipherHex, 'hex');

            const decipher = createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);

            return Buffer.concat([decipher.update(cipherText), decipher.final()]).toString('utf8');
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
}
