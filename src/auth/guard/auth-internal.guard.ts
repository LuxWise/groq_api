import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VaultService } from '../../vault/vault.service';

@Injectable()
export class AuthGuardInternal implements CanActivate {
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
      const payload = await this.jwtService.verifyAsync(token, {
        secret: await this.vaultService.getGroqApiJwtSecret(),
        algorithms: ["HS512"],
        clockTolerance: 5,
      });

      request.user = payload;
      request.authType = 'internal';

      return true;
    } catch (error) {
      throw new HttpException('Unauthorized', 401);
    }
  }
}
