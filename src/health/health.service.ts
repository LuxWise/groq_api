import { Injectable } from '@nestjs/common';
import { HealthOutput } from './type/health-output.types';

@Injectable()
export class HealthService {
    async getHealthStatus(): Promise<HealthOutput> {
        return { 
            status: 'OK' ,
            message: 'Service is healthy'
        };
    }
}
