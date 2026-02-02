import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class ApiResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello from API!';
  }
}
