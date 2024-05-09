import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { AuctionService } from '../auction.service';

@Injectable()
export default class AuctionOwnerGuard implements CanActivate {
  constructor(private readonly auctionService: AuctionService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const args = ctx.getArgs();
    const auctionId = args.id;
    const userId = req.user.id;
    return this.auctionService.isOwner(auctionId, userId);
  }

  handleRequest(err, user, _) {
    if (err || !user) {
      throw (
        err ||
        new ForbiddenException(
          "You don't have permission to perform this action",
        )
      );
    }
    return user;
  }
}
