import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { InputCreateCv } from './types/input-create-cv.types';
import { AuthGuardInternal } from '../auth/guard/auth-internal.guard';
import { ApiKeyGuard } from '../api-key/api-key.guard';
import { LogsInterceptor } from '../shared/logs.interceptor';

@UseInterceptors(LogsInterceptor)
@Controller('cv')
export class CvController {
    constructor(
        private readonly cvService: CvService
    ) { }
    
    @Post('create')
    @UseGuards(AuthGuardInternal)
    createCv(@Body() dto: CreateCvDto) {
        const input : InputCreateCv = {
            userDataPrompt: dto.userDataPrompt,
            jobOfferPrompt: dto.jobOfferPrompt
        }
        return this.cvService.createCv(input);
    }

    @Post('create/external')
    @UseGuards(ApiKeyGuard)
    createExternalCv(@Body() dto: CreateCvDto) {
        const input : InputCreateCv = {
            userDataPrompt: dto.userDataPrompt,
            jobOfferPrompt: dto.jobOfferPrompt
        }
        return this.cvService.createCv(input);
    }
}
