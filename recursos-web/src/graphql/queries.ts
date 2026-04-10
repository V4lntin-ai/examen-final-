import { gql } from '@apollo/client';

export const GET_RECURSOS = gql`
  query ListarRecursos($skip: Int, $take: Int) {
    recursos(skip: $skip, take: $take) {
      id
      titulo
      autor
      categorias {
        nombre
      }
    }
  }
`;

export const GET_ESTADISTICAS_CATEGORIAS = gql`
  query ContarRecursos {
    contarRecursosPorCategoria {
      nombre
      total_recursos
    }
  }
`;

export const GET_ESTADISTICAS_GENERALES = gql`
  query GetStats {
    estadisticas {
      totalRecursos
      totalAutores
    }
  }
`;

export const GET_AUTORES_AGRUPADOS = gql`
  query ListarAutores {
    autoresAgrupados {
      autor
      total_recursos
    }
  }
`;