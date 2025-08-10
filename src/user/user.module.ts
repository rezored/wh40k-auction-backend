import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserAddress } from './user-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAddress])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
