import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';

@ObjectType()
@Entity('recursos')
export class Recurso {
  @Field(() => Int)
  @PrimaryColumn()
  id!: number;

  @Field()
  @Column()
  titulo!: string;

  @Field()
  @Column()
  autor!: string;

  @Field(() => [Categoria], { nullable: true })
  @ManyToMany(() => Categoria, categoria => categoria.recursos)
  @JoinTable({
    name: 'recurso_categoria', 
    joinColumn: { name: 'recurso_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoria_id', referencedColumnName: 'id' },
  })
  categorias!: Categoria[];
}

@ObjectType()
export class EstadisticasGenerales {
  @Field(() => Int)
  totalRecursos!: number;

  @Field(() => Int)
  totalAutores!: number;
}

@ObjectType()
export class AutorCount {
  @Field()
  autor!: string;

  @Field(() => Int)
  total_recursos!: number;
}