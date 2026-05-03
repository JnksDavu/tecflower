import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AppLayout } from './layouts/AppLayout';
import { FinancialPage } from './pages/FinancialPage';
import { InventoryPage } from './pages/InventoryPage';
import { ProductCatalogPage } from './pages/ProductCatalogPage';
import { ProductCategoriesPage } from './pages/ProductCategoriesPage';
import { ProductTagsPage } from './pages/ProductTagsPage';
import { SalesPage } from './pages/SalesPage';
import { ConfigurationsPage } from './pages/ConfigurationsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const App = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/vendas" replace />} />
          <Route path="/vendas" element={<SalesPage />} />
          <Route path="/produtos" element={<Navigate to="/produtos/catalogo" replace />} />
          <Route path="/produtos/catalogo" element={<ProductCatalogPage />} />
          <Route path="/produtos/categorias" element={<ProductCategoriesPage />} />
          <Route path="/produtos/tags" element={<ProductTagsPage />} />
          <Route path="/estoque" element={<InventoryPage />} />
          <Route path="/financeiro" element={<FinancialPage />} />
          <Route path="/configuracoes" element={<ConfigurationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
