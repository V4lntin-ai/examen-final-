import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import { Recurso } from '../../recursos/entities/recurso.entity';

@ObjectType()
@Entity('categorias') 
export class Categoria {
  @Field(() => Int)
  @PrimaryColumn() 
  id!: number;

  @Field()
  @Column()
  nombre!: string;

  @Field()
  @Column()
  descripcion!: string;

  @Field(() => [Recurso], { nullable: true })
  @ManyToMany(() => Recurso, recurso => recurso.categorias)
  recursos!: Recurso[];
}

@ObjectType()
export class CategoriaCount {
  @Field()
  nombre!: string;

  @Field(() => Int)
  total_recursos!: number;
}