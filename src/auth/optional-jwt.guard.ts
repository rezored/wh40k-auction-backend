import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        // If no token is provided, allow the request to proceed without authentication
        if (!token) {
            console.log('🔓 Optional JWT Guard - No token provided, proceeding without authentication');
            return true;
        }

        console.log('🔓 Optional JWT Guard - Token found, attempting authentication');
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        // If there's an error or no user, just return null instead of throwing
        if (err || !user) {
            console.log('🔓 Optional JWT Guard - Authentication failed, proceeding without user');
            return null;
        }

        console.log('🔓 Optional JWT Guard - Authentication successful');
        return user;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
