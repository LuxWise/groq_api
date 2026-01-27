import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { OutputCreateUser } from './types/output-create-user.types';
import { CreateUserDto } from './dto/create-user.dto';
import { InputCreateUser } from './types/input-create-user.types';
import { AuthGuardInternal } from '../auth/guard/auth-internal.guard';
import { AuthGuardExternal } from '../auth/guard/auth-external.guard';
import { InputCreateExternalUser } from './types/input-create-external-user.types';
import { OutputCreateExternalUser } from './types/output-create-external-user.types';
import { CreateExternalUserDto } from './dto/create-external-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @UseGuards(AuthGuardInternal)
    async getAllUsers() {
        return this.usersService.findAllUsers();
    }

    @Post('register')
    @UseGuards(AuthGuardInternal)
    async createUser(@Body() dto: CreateUserDto): Promise<OutputCreateUser> {
        const input: InputCreateUser = {
            email: dto.email,
            password: dto.password,
            firstname: dto.firstname,
            lastname: dto.lastname
        }
        return this.usersService.createUser(input);
    }

    @Post('register/external')
    @UseGuards(AuthGuardExternal)
    async registerExternalUser(@Body() dto: CreateExternalUserDto): Promise<OutputCreateExternalUser> {
        const input: InputCreateExternalUser = {
            email: dto.email,
            password: dto.password,
            firstname: dto.firstname,
            lastname: dto.lastname
        }
        return this.usersService.createExternalUser(input);
    }
}
