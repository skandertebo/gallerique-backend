import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtSecret } from '../../jwtConstants';
import { UserService } from '../../user/user.service';
dotenv.config();

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secret: jwtSecret,
      secretOrKey: jwtSecret,
    });
  }
  async validate(payload: any) {
    const id = payload.sub;
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
