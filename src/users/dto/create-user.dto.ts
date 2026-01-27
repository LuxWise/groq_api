import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @Length(8, 100)
    email: string;

    @IsString()
    @Length(8, 128)
    password: string;
    
    @IsOptional()
    @IsString()
    @Length(1, 50)
    firstname?: string;
    
    @IsOptional()
    @IsString()
    @Length(1, 50)
    lastname?: string;
}