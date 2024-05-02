import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtSecret } from '../jwtConstants';
import UserModule from '../user/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import LocalAuthGuard from './guards/localAuth.guard';
import JwtStrategy from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: 999999999999 },
    }),
  ],
  providers: [
    AuthService,
    LocalAuthGuard,
    AuthResolver,
    JwtStrategy,
    JwtService,
  ],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
