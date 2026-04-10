import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { CategoriasService } from './services/categorias.service';
import { CategoriasResolver } from './categorias.resolver';
import { RecursosModule } from '../recursos/recursos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria]), forwardRef(() => RecursosModule)],
  providers: [CategoriasResolver, CategoriasService],
  exports: [TypeOrmModule],
})
export class CategoriasModule {}