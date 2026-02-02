import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.api.gql',
      playground: false,
      sortSchema: true,
      path: '/api',
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req, res }: any) => ({ req, res }),
      debug: false,
      formatError: (error) => {
        const originalError = error.extensions?.originalError as any;

        if (originalError) {
          return {
            message: originalError.message,
            code: originalError.statusCode,
            error: originalError.error,
          };
        }

        // 2. GraphQL parsing / schema errors
        if (error.extensions?.code === 'BAD_USER_INPUT') {
          return {
            message: error?.message,
            code: 400,
            error: 'BAD_USER_INPUT',
          };
        }

        // 3. Fallback for everything else
        return {
          message: 'Internal server error',
          code: 500,
          error: 'INTERNAL_SERVER_ERROR',
        };
      },
    }),
  ],
})
export class GraphQLProvider { }
