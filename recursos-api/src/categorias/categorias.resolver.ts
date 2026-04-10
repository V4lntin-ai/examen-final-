import { Resolver, Query } from '@nestjs/graphql';
import { CategoriasService } from './services/categorias.service';
import { Categoria, CategoriaCount } from './entities/categoria.entity';

@Resolver(() => Categoria)
export class CategoriasResolver {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Query(() => [Categoria], { name: 'categorias' })
  findAll() { return this.categoriasService.findAll(); }

  @Query(() => [CategoriaCount], { name: 'contarRecursosPorCategoria' })
  contarRecursos() { return this.categoriasService.contarRecursos(); }
}