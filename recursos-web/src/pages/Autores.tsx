import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_AUTORES_AGRUPADOS } from '../graphql/queries';
import { Users, User, Plus, Award, BookOpen } from 'lucide-react';

type AutorAgrupado = {
  autor: string;
  total_recursos: number;
};

type AutoresData = {
  autoresAgrupados: AutorAgrupado[];
};

export default function Autores() {
  const { data, loading, error } = useQuery<AutoresData>(GET_AUTORES_AGRUPADOS);
  const [autorSeleccionado, setAutorSeleccionado] = useState<any>(null);

  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;

  const autores = data?.autoresAgrupados || [];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <header>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Autores</h1>
          <p className="text-gray-500 font-medium mt-1">Conoce a los creadores de contenido</p>
        </header>
        <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} strokeWidth={3} />
          NUEVO AUTOR
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[600px]">
        
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Top 100 Autores</h3>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {loading ? (
              <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
              autores.map((item: any, index: number) => {
                const isSelected = autorSeleccionado?.autor === item.autor;
                return (
                  <div 
                    key={index} 
                    onClick={() => setAutorSeleccionado(item)}
                    className={`flex items-center gap-4 p-3 mb-1 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {item.autor.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={`font-bold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{item.autor}</h4>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{item.total_recursos} recursos publicados</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden p-8 border-dashed border-2 border-gray-300 items-center justify-center">
          
          {!autorSeleccionado ? (
            <div className="text-center text-gray-400">
              <Users size={64} className="mx-auto mb-4 opacity-50" strokeWidth={1} />
              <p className="text-lg font-medium">Selecciona un autor para ver sus detalles</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col animate-fade-in items-center text-center justify-center">
              <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-blue-50 flex items-center justify-center mb-6 shadow-inner">
                <User size={64} className="text-blue-600" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">{autorSeleccionado.autor}</h2>
              <span className="bg-gray-100 text-gray-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-8">
                Autor Verificado
              </span>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                  <BookOpen className="mx-auto mb-2 text-blue-500" size={28} />
                  <p className="text-3xl font-black text-gray-900">{autorSeleccionado.total_recursos}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Recursos Totales</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                  <Award className="mx-auto mb-2 text-amber-500" size={28} />
                  <p className="text-3xl font-black text-gray-900">#{(autores.findIndex((a: any) => a.autor === autorSeleccionado.autor)) + 1}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Ranking Global</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}