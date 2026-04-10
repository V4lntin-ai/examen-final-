import { useQuery } from '@apollo/client/react';
import { GET_ESTADISTICAS_CATEGORIAS } from '../graphql/queries';
import { Folder, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#1d4ed8', '#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#6b7280', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

type CategoriaStats = {
  nombre: string;
  total_recursos: number;
};

type StatsData = {
  contarRecursosPorCategoria: CategoriaStats[];
};

export default function Categorias() {
  const { data, loading, error } = useQuery<StatsData>(GET_ESTADISTICAS_CATEGORIAS);

  const categorias = data?.contarRecursosPorCategoria || [];
  const categoriasOrdenadas = [...categorias].sort((a: any, b: any) => b.total_recursos - a.total_recursos);
  
  const datosGrafica = categoriasOrdenadas.slice(0, 15);

  if (error) return <div className="p-10 text-red-500 bg-red-50 rounded-2xl">Error de conexión: {error.message}</div>;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <header>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Categorías</h1>
          <p className="text-gray-500 font-medium mt-1">Organiza los recursos por categorías temáticas</p>
        </header>
        <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} strokeWidth={3} />
          NUEVA CATEGORÍA
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Distribución de Recursos por Categoría</h3>
        <div className="h-80">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafica} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="nombre" 
                  tick={{fill: '#6b7280', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                  angle={-45} 
                  textAnchor="end"
                />
                <YAxis tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="total_recursos" radius={[4, 4, 0, 0]}>
                  {datosGrafica.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(12)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 h-28 animate-pulse flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : (
          categoriasOrdenadas.map((cat: any, index: number) => {
            const colorHex = COLORS[index % COLORS.length];
            return (
              <div key={cat.nombre} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-4 group cursor-pointer">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
                >
                  <Folder size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1" title={cat.nombre}>
                    {cat.nombre}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    {cat.total_recursos.toLocaleString()} recursos
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  );
}