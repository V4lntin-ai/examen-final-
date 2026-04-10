import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria, CategoriaCount } from '../entities/categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  async contarRecursos(): Promise<CategoriaCount[]> {
    const result = await this.categoriaRepository.createQueryBuilder('c')
      .leftJoin('c.recursos', 'r')
      .select('c.nombre', 'nombre')
      .addSelect('COUNT(r.id)', 'total_recursos')
      .groupBy('c.nombre')
      .getRawMany();

    return result.map(row => ({
      nombre: row.nombre,
      total_recursos: parseInt(row.total_recursos, 10),
    }));
  }
}