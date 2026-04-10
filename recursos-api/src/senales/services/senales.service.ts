import { Injectable } from '@nestjs/common';

@Injectable()
export class SenalesService {
  predecirValores(historico: number[], pasosFutuos: number): number[] {
    const predicciones = [...historico];
    for (let i = 0; i < pasosFutuos; i++) {
      const n = predicciones.length;
      const nextValue = (0.5 * predicciones[n - 1]) + (0.25 * predicciones[n - 2]);
      predicciones.push(nextValue);
    }
    return predicciones.slice(-pasosFutuos);
  }

  estimarSenal(entradaReal: number[]): number[] {
    const salida: number[] = [];
    for (let n = 0; n < entradaReal.length; n++) {
      const y1 = n >= 1 ? salida[n - 1] : 0;
      const y2 = n >= 2 ? salida[n - 2] : 0;
      const xn = entradaReal[n];
      salida.push((0.5 * y1) + (0.25 * y2) + xn);
    }
    return salida;
  }
}