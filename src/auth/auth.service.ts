import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import CreateUserDto from '../user/dto/createUser.dto';
import User from '../user/user.entity';
import { UserService } from '../user/user.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      if (!(await this.localPasswordValidation(pass, user.password))) {
        throw new UnauthorizedException('Password is incorrect');
      }
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Email is incorrect');
  }

  async login(user: Omit<User, 'password'>) {
    const payload = {
      email: user.email,
      sub: user.id,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      user,
      access_token: token,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) throw new BadRequestException('User already exists');
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.login(user);
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async validateToken(token: string) {
    return await this.jwtService.verifyAsync(token);
  }

  async localPasswordValidation(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
