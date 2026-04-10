import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recurso } from './entities/recurso.entity';
import { RecursosService } from './services/recursos.service';
import { RecursosResolver } from './recursos.resolver';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recurso]), forwardRef(() => CategoriasModule)],
  providers: [RecursosResolver, RecursosService],
  exports: [TypeOrmModule],
})
export class RecursosModule {}