import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretkey',
    });
  }

  async validate(payload: any) {
    console.log('🔐 JWT Strategy - Validating payload:', payload);
    const user = { id: payload.sub, email: payload.email };
    console.log('🔐 JWT Strategy - Returning user:', user);
    return user;
  }
} 