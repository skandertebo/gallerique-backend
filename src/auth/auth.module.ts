import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtSecret } from '../jwtConstants';
import UserModule from '../user/user.module';
import { AuthService } from './auth.service';
import LocalAuthGuard from './guards/localAuth.guard';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    UserModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, LocalStrategy, LocalAuthGuard],
})
export class AuthModule {}
