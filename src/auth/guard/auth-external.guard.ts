import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VaultService } from '../../vault/vault.service';

@Injectable()
export class AuthGuardExternal implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly vaultService: VaultService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new HttpException('Authorization header missing', 401);
    }

    const [prefix, token] = authHeader.split(' ');
    if (prefix !== 'Bearer' || !token) {
      throw new HttpException('Invalid authorization header format', 401);
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token,{
        publicKey: await this.vaultService.getPublicKey(),
        algorithms: ['RS256'],
        issuer: await this.vaultService.getJwtIssuer(),
        audience: await this.vaultService.getJwtAudience(),
      });
      request.user = decoded;

      return true;
    } catch (error) {
      throw new HttpException('Unauthorized', 401);
    }
  }
}
