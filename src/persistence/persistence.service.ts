import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PersistenceService extends PrismaClient {
    constructor(private readonly configService: ConfigService) {
        const connectionString = configService.get<string>('DATABASE_URL');

        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }

        const adapter = new PrismaPg({ connectionString});
        super({adapter});
    }
}
