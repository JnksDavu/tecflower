import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { FinancialPage } from './pages/FinancialPage';
import { ProductsPage } from './pages/ProductsPage';
import { SalesPage } from './pages/SalesPage';
import { ConfigurationsPage } from './pages/ConfigurationsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/vendas" element={<SalesPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/financeiro" element={<FinancialPage />} />
        <Route path="/configuracoes" element={<ConfigurationsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
