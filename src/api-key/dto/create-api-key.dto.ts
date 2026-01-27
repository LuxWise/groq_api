import { IsDate, IsOptional } from "class-validator";

export class CreateApiKeyDto {
    @IsDate()
    @IsOptional()
    expiresAt?: Date;
}