import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Folder, Users, LineChart } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard, section: 'PRINCIPAL' },
    { path: '/recursos', name: 'Recursos', icon: FileText, section: 'GESTIÓN' },
    { path: '/categorias', name: 'Categorías', icon: Folder, section: 'GESTIÓN' },
    { path: '/autores', name: 'Autores', icon: Users, section: 'GESTIÓN' },
    { path: '/predicciones', name: 'Predicciones', icon: LineChart, section: 'ANÁLISIS' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">DATOS_LAB</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const showSection = index === 0 || menuItems[index - 1].section !== item.section;

            return (
              <div key={item.name}>
                {showSection && (
                  <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2">
                    {item.section}
                  </p>
                )}
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-700 text-white shadow-md shadow-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 font-medium">VERSIÓN 1.0.0</p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DINÁMICA */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* Aquí se inyectan las demás pantallas */}
      </main>
    </div>
  );
}