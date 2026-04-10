import { Resolver, Query, Args, Float, Int } from '@nestjs/graphql';
import { SenalesService } from './services/senales.service';

@Resolver()
export class SenalesResolver {
  constructor(private readonly senalesService: SenalesService) {}

  @Query(() => [Float], { name: 'predecirValoresFuturos' })
  predecir(
    @Args('muestrasHistoricas', { type: () => [Float] }) historico: number[],
    @Args('pasos', { type: () => Int }) pasos: number,
  ) {
    return this.senalesService.predecirValores(historico, pasos);
  }

  @Query(() => [Float], { name: 'estimarComportamientoSenal' })
  estimar(
    @Args('muestrasDeEntrada', { type: () => [Float] }) entrada: number[],
  ) {
    return this.senalesService.estimarSenal(entrada);
  }
}