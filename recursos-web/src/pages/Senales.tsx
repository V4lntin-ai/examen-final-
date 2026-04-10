export default function Senales() {
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Laboratorio de Señales</h1>
        <p className="text-gray-500 font-medium mt-1">Análisis y predicción usando Transformada de Laplace Discreta (Z)</p>
      </header>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
        <h2 className="text-2xl text-blue-600 font-bold animate-pulse">
          Próximamente: Motor de predicción matemática...
        </h2>
        <p className="text-gray-500 mt-4 max-w-md mx-auto">
          Aquí conectaremos los algoritmos de Node.js para estimar el comportamiento de las señales en tiempo real.
        </p>
      </div>
    </div>
  );
}