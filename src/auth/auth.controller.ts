import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InputLogin } from './types/input-login.types';
import { OutputLogin } from './types/output-login.types';
import { LoginDto } from './dto/login.dto';
import { LogsInterceptor } from '../shared/logs.interceptor';

@UseInterceptors(LogsInterceptor)
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('login')
    async login(@Body() dto: LoginDto): Promise<OutputLogin> {
        const input: InputLogin = {
            email: dto.email,
            password: dto.password
        };

        return this.authService.login(input);
    }
}
