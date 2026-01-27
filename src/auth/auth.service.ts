import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InputLogin } from './types/input-login.types';
import { UsersService } from '../users/users.service';
import { OutputLogin } from './types/output-login.types';
import { CompareUtil } from './utils/compare.utils';
import { VaultService } from '../vault/vault.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly compareUtil: CompareUtil,
        private readonly vaultService: VaultService,
    ) { }

    async login(data: InputLogin): Promise<OutputLogin> {
        const user = await this.usersService.findUserByEmail(data.email);
        if (!user) {
            return {
                status: 'error',
                message: 'Invalid credentials'
            }
        }

        const passwordMatches = await this.compareUtil.comparePasswords(data.password, user.password);
        if (!passwordMatches) {
            throw new HttpException('Invalid credentials', 401);
        }

        try {
            const payload = { sub: user.id, email: user.email };
            const token = await this.jwtService.signAsync(payload, {
                secret: await this.vaultService.getGroqApiJwtSecret(),
                algorithm: 'HS512',
                expiresIn: '1h'
            });
            return {
                status: 'success',
                access_token: token,
                expiresIn: '1h'
            };
        } catch (error) {
            throw new HttpException('Login failed', 500);
        }
    }
}
