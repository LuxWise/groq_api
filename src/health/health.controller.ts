import { Controller, Get } from '@nestjs/common';
import { HealthOutput } from './type/health-output.types';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get()
    async getHealth(): Promise<HealthOutput> {
        return this.healthService.getHealthStatus();
    }
}
