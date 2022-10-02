import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserAuthority} from "../domain/user-authority.entity";
import {JwtModule} from "@nestjs/jwt";
import {User} from "../domain/user.entity";
import {PassportModule} from "@nestjs/passport";
import {UserService} from "./user.service";
import {JwtStrategy} from "./security/passport.jwt.strategy";

@Module({
  imports: [
      TypeOrmModule.forFeature([User, UserAuthority]),
      JwtModule.register({
        secret: 'secret',
        signOptions: {expiresIn: '300s'}
      }),
      PassportModule
  ],
  exports: [TypeOrmModule, AuthService, UserService],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy]
})
export class AuthModule {}
