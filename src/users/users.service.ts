import { HttpException, Inject, Injectable, UseGuards } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { InputCreateUser } from './types/input-create-user.types';
import { OutputCreateUser } from './types/output-create-user.types';
import { EncryptPasswordUtil } from './utils/encrypt-password.util';
import { ApiKeyService } from '../api-key/api-key.service';
import { InputCreateExternalUser } from './types/input-create-external-user.types';
import { OutputCreateExternalUser } from './types/output-create-external-user.types';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UsersService {
    constructor(
        @Inject(REQUEST) private readonly req: any,
        private readonly encryptPasswordUtil: EncryptPasswordUtil,
        private readonly persistence: PersistenceService,
        private readonly apiKeyService: ApiKeyService
    ) { }
    
    async createUser(data: InputCreateUser): Promise<OutputCreateUser> {
        const userReq = this.req.user;
        const userGrant =  await this.findUserByEmail(userReq.email, 'admin');
        if (!userGrant) {
            throw new HttpException('Unauthorized to create user', 403);
        }

        const userExists = await this.findUserByEmail(data.email);
        if (userExists) {
            throw new HttpException('User with this email already exists', 400);
        }

        const role = await this.persistence.role.findUnique({
            where: { name: 'user' }
        });

        if (!role) {
            throw new HttpException('Default user role not found', 500);
        }

        const user = await this.persistence.users.create({
            data: {
                email: data.email,
                password: await this.encryptPasswordUtil.encryptPassword(data.password),
                firstname: data.firstname,
                lastname: data.lastname,
                roleId: role.id
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
        const userExists = await this.findUserByEmail(data.email, 'external');
        if (userExists) {
            throw new HttpException('User with this email already exists', 400);
        }

        const role = await this.persistence.role.findUnique({
            where: { name: 'external' }
        });

        if (!role) {
            throw new HttpException('Default external user role not found', 500);
        }

        const user = await this.persistence.users.create({
            data: {
                email: data.email,
                password: data.password,
                firstname: data.firstname,
                lastname: data.lastname,
                roleId: role.id
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
            api_key: key,
        }
    }

    async findUserByEmail(email: string, role?: 'admin' | 'user' | 'external') {
        return this.persistence.users.findUnique({
            where: { email, roleId: role ? undefined : undefined },
        });
    }

    async findAllUsers() {
        const userReq = this.req.user;
        const userGrant =  await this.findUserByEmail(userReq.email, 'admin');
        if (!userGrant) {
            throw new HttpException('Unauthorized to view users', 403);
        }

        return this.persistence.users.findMany();
    }
}
