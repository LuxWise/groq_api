import { IsEmail, IsString, Length } from "class-validator";

export class LoginDto {
    @IsEmail()
    @Length(8, 100)
    email: string;

    @IsString()
    @Length(8, 128)
    password: string;
}