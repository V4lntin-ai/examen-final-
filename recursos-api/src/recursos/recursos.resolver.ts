import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { RecursosService } from './services/recursos.service';
import { Recurso, EstadisticasGenerales, AutorCount } from './entities/recurso.entity';

@Resolver(() => Recurso)
export class RecursosResolver {
  constructor(private readonly recursosService: RecursosService) {}

  @Query(() => [Recurso], { name: 'recursos' })
  findAll(
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 15 }) take: number,
    @Args('titulo', { nullable: true }) titulo?: string,
    @Args('categoriaId', { type: () => Int, nullable: true }) categoriaId?: number,
    @Args('autor', { nullable: true }) autor?: string,
  ) { 
    return this.recursosService.findAll(skip, take, titulo, categoriaId, autor); 
  }

  @Query(() => [Recurso], { name: 'recursosPorAutor' })
  findByAutor(@Args('autor') autor: string) { return this.recursosService.findByAutor(autor); }

  @Query(() => [Recurso], { name: 'recursosSinCategoria' })
  findSinCategoria() { return this.recursosService.findSinCategoria(); }

  @Query(() => EstadisticasGenerales, { name: 'estadisticas' })
  getEstadisticas() { 
    return this.recursosService.getEstadisticasGenerales(); 
  }

  @Query(() => [AutorCount], { name: 'autoresAgrupados' })
  getAutoresAgrupados() {
    return this.recursosService.getAutoresAgrupados();
  }
}