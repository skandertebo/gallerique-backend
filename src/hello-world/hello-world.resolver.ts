import { Query, Resolver } from '@nestjs/graphql';
import { HelloWorldSchema } from './schemas/hello-world.schema';

@Resolver()
export class HelloWorldResolver {
  constructor() {}

  @Query(() => HelloWorldSchema)
  async sayHello() {
    return {
      message: 'hello world!',
    };
  }
}
