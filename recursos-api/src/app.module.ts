import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CategoriasModule } from './categorias/categorias.module';
import { RecursosModule } from './recursos/recursos.module';
import { SenalesModule } from './senales/senales.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), 
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: 'v4lntin', 
      password: 'root',     
      database: 'recursos_db', 
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, 
    }),
    CategoriasModule,
    RecursosModule,
    SenalesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}