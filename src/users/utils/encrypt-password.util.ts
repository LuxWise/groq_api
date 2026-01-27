import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptPasswordUtil {
    constructor(
        private readonly configService: ConfigService
    ) {}

    async encryptPassword(password: string): Promise<string> {
        const saltRoundsEnv = this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10');
        const saltRounds = Number.parseInt(saltRoundsEnv) || 10;

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;  
    }
}