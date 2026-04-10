import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recurso } from '../entities/recurso.entity';

@Injectable()
export class RecursosService {
  constructor(
    @InjectRepository(Recurso)
    private recursoRepository: Repository<Recurso>,
  ) {}

  async findAll(
    skip: number = 0, 
    take: number = 15,
    titulo?: string,
    categoriaId?: number,
    autor?: string
  ): Promise<Recurso[]> {
    const query = this.recursoRepository.createQueryBuilder('recurso')
      .leftJoinAndSelect('recurso.categorias', 'categoria')
      .skip(skip)
      .take(take)
      .orderBy('recurso.id', 'DESC');

    // Filtro por Título (Búsqueda parcial)
    if (titulo) {
      query.andWhere('recurso.titulo LIKE :titulo', { titulo: `%${titulo}%` });
    }

    // Filtro por Autor
    if (autor) {
      query.andWhere('recurso.autor = :autor', { autor });
    }

    // Filtro por Categoría
    if (categoriaId) {
      query.andWhere('categoria.id = :categoriaId', { categoriaId });
    }

    return query.getMany();
  }

  async findByAutor(autor: string): Promise<Recurso[]> {
    return this.recursoRepository.find({ where: { autor }, relations: ['categorias'], take: 50 });
  }

  async findSinCategoria(): Promise<Recurso[]> {
    return this.recursoRepository.createQueryBuilder('r')
      .leftJoin('r.categorias', 'c')
      .where('c.id IS NULL')
      .take(50)
      .getMany();
  }

  async getEstadisticasGenerales(): Promise<{ totalRecursos: number, totalAutores: number }> {
    const totalRecursos = await this.recursoRepository.count();
    
    const { totalAutores } = await this.recursoRepository.createQueryBuilder('r')
      .select('COUNT(DISTINCT r.autor)', 'totalAutores')
      .getRawOne();

    return {
      totalRecursos,
      totalAutores: parseInt(totalAutores, 10)
    };
  }

  async getAutoresAgrupados(): Promise<{autor: string, total_recursos: number}[]> {
    const result = await this.recursoRepository.createQueryBuilder('r')
      .select('r.autor', 'autor')
      .addSelect('COUNT(r.id)', 'total_recursos')
      .groupBy('r.autor') 
      .orderBy('total_recursos', 'DESC') 
      .limit(100) 
      .getRawMany();

    return result.map(row => ({
      autor: row.autor,
      total_recursos: parseInt(row.total_recursos, 10),
    }));
  }
}