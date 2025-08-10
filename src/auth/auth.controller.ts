import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService) { }

    @Post('register')
    async register(@Body() body) {
        const hashed = await bcrypt.hash(body.password, 10);

        // Generate a default username if not provided
        const username = body.username || `user_${Date.now()}`;

        return this.userService.createUser({
            ...body,
            password: hashed,
            username
        });
    }

    @Post('login')
    async login(@Body() body) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) return { error: 'Invalid credentials' };
        return this.authService.login(user);
    }
}
