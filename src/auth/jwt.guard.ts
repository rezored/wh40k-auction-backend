import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('🛡️ JWT Guard - Attempting to authenticate request');
    const request = context.switchToHttp().getRequest();
    console.log('🛡️ JWT Guard - Request headers:', request.headers);
    console.log('🛡️ JWT Guard - Authorization header:', request.headers.authorization);
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🛡️ JWT Guard - handleRequest called');
    console.log('🛡️ JWT Guard - Error:', err);
    console.log('🛡️ JWT Guard - User:', user);
    console.log('🛡️ JWT Guard - Info:', info);
    
    if (err || !user) {
      console.log('🛡️ JWT Guard - Authentication failed');
      
      // Check if it's a token expiration error
      if (info && info.message === 'jwt expired') {
        throw new UnauthorizedException({
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
          statusCode: 401
        });
      }
      
      throw new UnauthorizedException('Unauthorized');
    }
    
    console.log('🛡️ JWT Guard - Authentication successful');
    return user;
  }
}
