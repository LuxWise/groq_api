import { IsString } from "class-validator";

export class CreateCvDto {
    @IsString()
    userDataPrompt: string;

    @IsString()
    jobOfferPrompt: string;
}