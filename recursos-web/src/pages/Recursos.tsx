import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_RECURSOS_FILTRADOS, LISTAR_CATEGORIAS_SIMPLE } from '../graphql/queries';
import { Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';

type Recurso = {
  id: string | number;
  titulo: string;
  autor: string;
  categorias: { id: string | number; nombre: string }[];
};

type RecursosData = {
  recursos: Recurso[];
};

type Categoria = {
  id: string | number;
  nombre: string;
};

type CategoriasData = {
  categorias: Categoria[];
};

export default function Recursos() {
  // Estados para filtros y paginación
  const [paginaActual, setPaginaActual] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [autorFiltro, setAutorFiltro] = useState('');
  const [catSeleccionada, setCatSeleccionada] = useState<string>('');
  const [mostrarFiltrosExtra, setMostrarFiltrosExtra] = useState(false);
  
  const itemsPorPagina = 12;

  // 1. Cargar categorías reales para el SELECT
  const { data: dataCat } = useQuery<CategoriasData>(LISTAR_CATEGORIAS_SIMPLE);

  // 2. Consulta principal con filtros dinámicos
  const { data, loading, error, refetch } = useQuery<RecursosData>(GET_RECURSOS_FILTRADOS, {
    variables: { 
      skip: paginaActual * itemsPorPagina, 
      take: itemsPorPagina,
      titulo: busqueda || undefined, // Evita enviar strings vacíos
      categoriaId: catSeleccionada ? parseInt(catSeleccionada) : undefined,
      autor: autorFiltro || undefined
    },
    fetchPolicy: 'cache-and-network'
  });

  // Reiniciar a la página 0 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(0);
  }, [busqueda, catSeleccionada, autorFiltro]);

  const nextPagina = () => setPaginaActual(prev => prev + 1);
  const prevPagina = () => setPaginaActual(prev => Math.max(0, prev - 1));

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setCatSeleccionada('');
    setAutorFiltro('');
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Recursos</h1>
        <p className="text-gray-500 font-medium mt-1">Gestiona y explora todos los recursos de información</p>
      </header>

      {/* BARRA DE BÚSQUEDA Y FILTROS FUNCIONALES */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Búsqueda por Título */}
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Título del Recurso</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej: React Native, Bases de Datos..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          
          {/* Categoría Dinámica */}
          <div className="w-full md:w-56">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Categoría</label>
            <select 
              value={catSeleccionada}
              onChange={(e) => setCatSeleccionada(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Todas las categorías</option>
              {dataCat?.categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setMostrarFiltrosExtra(!mostrarFiltrosExtra)}
            className={`flex items-center gap-2 px-6 py-2 border-2 ${mostrarFiltrosExtra ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-gray-900 text-gray-900'} font-bold rounded-lg hover:bg-gray-100 transition-colors w-full md:w-auto justify-center`}
          >
            <Filter size={18} />
            {mostrarFiltrosExtra ? 'CERRAR' : 'FILTROS'}
          </button>
        </div>

        {/* Panel de Filtros Extra (Autor) */}
        {mostrarFiltrosExtra && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
            <div className="w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Filtrar por Autor</label>
              <input 
                type="text" 
                value={autorFiltro}
                onChange={(e) => setAutorFiltro(e.target.value)}
                placeholder="Nombre del autor..." 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={limpiarFiltros}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 mb-3"
              >
                <X size={14} /> LIMPIAR FILTROS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INDICADOR DE RESULTADOS Y PAGINACIÓN */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {loading ? 'Cargando...' : `Mostrando página ${paginaActual + 1}`}
        </p>
        
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
            disabled={!data || data.recursos.length < itemsPorPagina || loading}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* GRID DE RECURSOS */}
      {error ? (
        <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl border border-red-200">
          No se pudieron cargar los recursos. Verifique la conexión con la API.
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 h-48 animate-pulse flex flex-col justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : data?.recursos.length === 0 ? (
        <div className="p-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold uppercase tracking-widest">No se encontraron recursos con esos filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.recursos.map((recurso: Recurso) => {
            const categoriaPrincipal = recurso.categorias[0]?.nombre || 'Sin Categoría';
            return (
              <div key={recurso.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">DOC #{recurso.id}</span>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {categoriaPrincipal}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                    {recurso.titulo}
                  </h3>
                  
                  <div className="mt-auto pt-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs">
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