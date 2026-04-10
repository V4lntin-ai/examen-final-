import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_RECURSOS } from '../graphql/queries';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

type Recurso = {
  id: string | number;
  titulo: string;
  autor: string;
  categorias: { nombre: string }[];
};

type RecursosData = {
  recursos: Recurso[];
};

export default function Recursos() {
  const [paginaActual, setPaginaActual] = useState(0);
  const itemsPorPagina = 12;

  const { data, loading, error } = useQuery<RecursosData>(GET_RECURSOS, {
    variables: { 
      skip: paginaActual * itemsPorPagina, 
      take: itemsPorPagina 
    },
    fetchPolicy: 'cache-and-network'
  });

  const nextPagina = () => setPaginaActual(prev => prev + 1);
  const prevPagina = () => setPaginaActual(prev => Math.max(0, prev - 1));

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Recursos</h1>
        <p className="text-gray-500 font-medium mt-1">Gestiona y explora todos los recursos de información</p>
      </header>

      {/* BARRA DE BÚSQUEDA Y FILTROS (Diseño visual basado en tu mockup) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar recursos por título..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="w-full md:w-48">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Categoría</label>
          <select className="w-full py-2 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none">
            <option>Todas</option>
            <option>Sistemas</option>
            <option>Matemáticas</option>
          </select>
        </div>

        <button className="flex items-center gap-2 px-6 py-2 border-2 border-gray-900 text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors w-full md:w-auto justify-center">
          <Filter size={18} />
          FILTROS
        </button>
      </div>

      {/* RESULTADOS Y PAGINACIÓN */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Mostrando página {paginaActual + 1}
        </p>
        
        {/* Controles de Paginación */}
        <div className="flex gap-2">
          <button 
            onClick={prevPagina} 
            disabled={paginaActual === 0 || loading}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextPagina}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* CUADRÍCULA DE TARJETAS */}
      {error ? (
        <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl border border-red-200">
          Error al cargar los datos: {error.message}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 h-48 animate-pulse flex flex-col justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="mt-auto flex items-center gap-3 pt-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.recursos.map((recurso: any) => {
            const categoriaName = recurso.categorias[0]?.nombre || 'Sin Categoría';
            const catColor = categoriaName === 'Sin Categoría' ? 'bg-gray-500' : 'bg-blue-700';

            return (
              <div key={recurso.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
                <div className="p-6 flex-1 flex flex-col">
                  {/* Etiqueta Superior */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">DOC #{recurso.id}</span>
                    <span className={`${catColor} text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
                      {categoriaName}
                    </span>
                  </div>
                  
                  {/* Título y Autor */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                    {recurso.titulo}
                  </h3>
                  
                  <div className="mt-auto pt-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                      {recurso.autor.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-600">{recurso.autor}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}