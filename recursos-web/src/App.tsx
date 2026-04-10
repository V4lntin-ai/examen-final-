import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Senales from './pages/Senales';
import Recursos from './pages/Recursos';
import Categorias from './pages/Categorias';
import Autores from './pages/Autores';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="recursos" element={<Recursos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="autores" element={<Autores />} />
          <Route path="predicciones" element={<Senales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;