import { Module } from '@nestjs/common';
import { FormatsService } from './formats.service';
import { VaultModule } from '../vault/vault.module';

@Module({
  imports: [VaultModule],
  providers: [FormatsService]
})
export class FormatsModule {}
