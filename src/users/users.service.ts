import { HttpException, Injectable } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { InputCreateUser } from './types/input-create-user.types';
import { OutputCreateUser } from './types/output-create-user.types';
import { EncryptPasswordUtil } from './utils/encrypt-password.util';
import { ApiKeyService } from '../api-key/api-key.service';
import { InputCreateExternalUser } from './types/input-create-external-user.types';
import { OutputCreateExternalUser } from './types/output-create-external-user.types';

@Injectable()
export class UsersService {
    constructor(
        private readonly encryptPasswordUtil: EncryptPasswordUtil,
        private readonly persistence: PersistenceService,
        private readonly apiKeyService: ApiKeyService
    ) {}

    async createUser(data: InputCreateUser): Promise<OutputCreateUser> {
        const userExists = await this.findUserByEmail(data.email);
        if (userExists) {
            throw new HttpException('User with this email already exists', 400);
        }

        const user = await this.persistence.users.create({
            data: {
                email: data.email,
                password: await this.encryptPasswordUtil.encryptPassword(data.password),
                firstname: data.firstname,
                lastname: data.lastname
            }
        })

        if (!user) {
            throw new HttpException('Error creating user', 500);
        }

        return {
            status: 'success',
            message: 'User created successfully',
            userId: user.id
        }
    }

    async createExternalUser(data: InputCreateExternalUser): Promise<OutputCreateExternalUser> {
        const userExists = await this.findUserByEmail(data.email);
        if (userExists) {
            throw new HttpException('User with this email already exists', 400);
        }

        const user = await this.persistence.users.create({
            data: {
                email: data.email,
                password: data.password,
                firstname: data.firstname,
                lastname: data.lastname
            }
        })

        if (!user) {
            throw new HttpException('Error creating user', 500);
        }

        const key = await this.apiKeyService.createKey({ userId: user.id });

        return {
            status: 'success',
            message: 'External user created successfully',
            userId: user.id,
            api_key: key
        }
    }

    async findUserByEmail(email: string) {
        return this.persistence.users.findUnique({
            where: { email }
        });
    }

    async findAllUsers() {
        return this.persistence.users.findMany();
    }
}
