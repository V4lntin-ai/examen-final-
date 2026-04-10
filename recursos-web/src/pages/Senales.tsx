import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Consulta GraphQL que conecta con tu SenalesResolver 
const ANALISIS_DEMANDA_RECURSOS = gql`
  query GetAnalisis($historico: [Float!]!, $pasos: Int!) {
    predecirValoresFuturos(muestrasHistoricas: $historico, pasos: $pasos)
    estimarComportamientoSenal(muestrasDeEntrada: $historico)
  }
`;

interface GetAnalisisData {
  predecirValoresFuturos: number[];
  estimarComportamientoSenal: number[];
}

const PrediccionesScreen: React.FC = () => {
  // Datos de ejemplo: Consultas diarias de un recurso de la base de datos
  const [datosHistoricos] = useState([120, 135, 150, 145, 160, 175, 190, 185]);
  
  const { data, loading, error } = useQuery<GetAnalisisData>(ANALISIS_DEMANDA_RECURSOS, {
    variables: { historico: datosHistoricos, pasos: 4 },
  });

  if (loading) return <div className="p-8 text-center text-blue-600">Calculando transformada de Laplace...</div>;
  if (error) return <div className="p-8 text-red-500 text-center">Error en el análisis: {error.message}</div>;

  // Formateo de datos para la gráfica de Recharts
  const chartData: { periodo: string; consultasReales: number | null; tendenciaEstimada: number | null; proyeccionFutura: number | null }[] = datosHistoricos.map((val, i) => ({
    periodo: `Día ${i + 1}`,
    consultasReales: val,
    tendenciaEstimada: data?.estimarComportamientoSenal[i] || null, // Basado en estimarSenal
    proyeccionFutura: i === datosHistoricos.length - 1 ? val : null,
  }));

  // Agregar la predicción calculada por el backend
  data?.predecirValoresFuturos.forEach((val: number, i: number) => {
    chartData.push({
      periodo: `Futuro ${i + 1}`,
      consultasReales: null,
      tendenciaEstimada: null,
      proyeccionFutura: val,
    });
  });

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Predicción de Demanda de Recursos</h2>
        <p className="text-sm text-gray-500">Modelado matemático mediante Transformada de Laplace Discreta</p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="periodo" tick={{fontSize: 12}} />
            <YAxis tick={{fontSize: 12}} />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
            <Legend />
            
            {/* Señal Original: Consultas reales del sistema */}
            <Line 
              type="monotone" 
              dataKey="consultasReales" 
              name="Uso Real" 
              stroke="#6366f1" 
              strokeWidth={3} 
              dot={{r: 4}} 
            />
            
            {/* Estimación: Tendencia estable calculada por y[n] = 0.5y[n-1] + 0.25y[n-2] + x[n] */}
            <Line 
              type="monotone" 
              dataKey="tendenciaEstimada" 
              name="Tendencia (Estima)" 
              stroke="#10b981" 
              strokeDasharray="5 5" 
            />
            
            {/* Predicción: Valores futuros proyectados */}
            <Line 
              type="basis" 
              dataKey="proyeccionFutura" 
              name="Predicción" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              strokeDasharray="3 3"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-green-100 bg-green-50 rounded-lg">
          <span className="font-semibold text-green-800">Interpretación de Estimación:</span>
          <p className="text-sm text-green-700">Identifica el crecimiento estable del recurso eliminando fluctuaciones diarias accidentales.</p>
        </div>
        <div className="p-4 border border-amber-100 bg-amber-50 rounded-lg">
          <span className="font-semibold text-amber-800">Interpretación de Predicción:</span>
          <p className="text-sm text-amber-700">Anticipa la necesidad de servidores o soporte basándose en la inercia de crecimiento actual.</p>
        </div>
      </div>
    </div>
  );
};

export default PrediccionesScreen;