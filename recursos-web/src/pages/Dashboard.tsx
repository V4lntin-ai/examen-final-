import { useQuery } from '@apollo/client/react';
import { GET_RECURSOS, GET_ESTADISTICAS_CATEGORIAS, GET_ESTADISTICAS_GENERALES } from '../graphql/queries';
import { FileText, Folder, Users, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1d4ed8', '#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#6b7280', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// --- TIPOS DE TYPESCRIPT ---
type Recurso = {
  id: string | number;
  titulo: string;
  autor: string;
  categorias: { nombre: string }[];
};

type RecursosData = {
  recursos: Recurso[];
};

type CategoriaStats = {
  nombre: string;
  total_recursos: number;
};

type StatsData = {
  contarRecursosPorCategoria: CategoriaStats[];
};

// Tipo para nuestros nuevos datos reales
type EstadisticasGeneralesData = {
  estadisticas: {
    totalRecursos: number;
    totalAutores: number;
  };
};

export default function Dashboard() {
  // --- CONSULTAS A LA BASE DE DATOS ---
  const { data: dataRecursos, loading: loadingRecursos } = useQuery<RecursosData>(GET_RECURSOS);
  const { data: dataStats, loading: loadingStats } = useQuery<StatsData>(GET_ESTADISTICAS_CATEGORIAS);
  const { data: realStats } = useQuery<EstadisticasGeneralesData>(GET_ESTADISTICAS_GENERALES);

  // --- PROCESAMIENTO DE DATOS ---
  const categorias = dataStats?.contarRecursosPorCategoria || [];
  
  const top10Categorias = [...categorias]
    .sort((a: any, b: any) => b.total_recursos - a.total_recursos)
    .slice(0, 10);

  const totalCategorias = categorias.length;
  const huerfanos = categorias.find((c: any) => c.nombre === 'Sin Categoría')?.total_recursos || 0;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 font-medium mt-1">Vista general de los recursos de información</p>
      </header>

      {/* TARJETAS CON DATOS 100% REALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="TOTAL RECURSOS" 
          value={realStats?.estadisticas?.totalRecursos?.toLocaleString() || '...'} 
          icon={FileText} 
          color="bg-blue-700" 
        />
        <StatCard 
          title="CATEGORÍAS" 
          value={totalCategorias} 
          icon={Folder} 
          color="bg-green-500" 
        />
        <StatCard 
          title="AUTORES ÚNICOS" 
          value={realStats?.estadisticas?.totalAutores?.toLocaleString() || '...'} 
          icon={Users} 
          color="bg-gray-800" 
        />
        <StatCard 
          title="SIN CATEGORÍA" 
          value={huerfanos} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Top 10 Categorías</h3>
          <div className="h-64">
            {!loadingStats && top10Categorias.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Categorias} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="nombre" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={110} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="total_recursos" radius={[0, 4, 4, 0]}>
                    {top10Categorias.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Distribución (Top 10)</h3>
          <div className="h-64">
             {!loadingStats && top10Categorias.length > 0 && (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={top10Categorias} dataKey="total_recursos" nameKey="nombre" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                     {top10Categorias.map((_: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 </PieChart>
               </ResponsiveContainer>
             )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recursos Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Autor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loadingRecursos && dataRecursos?.recursos?.slice(0, 5).map((recurso: any) => (
                <tr key={recurso.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{recurso.titulo}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {recurso.categorias[0]?.nombre || 'Sin Categoría'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                      {recurso.autor.charAt(0).toUpperCase()}
                    </div>
                    {recurso.autor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h4 className="text-3xl font-black text-gray-900">{value}</h4>
      </div>
      <div className={`${color} p-4 rounded-xl text-white shadow-inner`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
  );
}