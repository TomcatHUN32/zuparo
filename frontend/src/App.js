import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from './components/ui/sonner';
import { DataProvider } from './context/DataContext';

import AdminLayout from './pages/admin/AdminLayout';
import NewOrder from './pages/admin/NewOrder';
import Orders from './pages/admin/Orders';
import Couriers from './pages/admin/Couriers';
import Customers from './pages/admin/Customers';
import MenuAdmin from './pages/admin/MenuAdmin';
import Inventory from './pages/admin/Inventory';
import Statistics from './pages/admin/Statistics';
import Settings from './pages/admin/Settings';

import CustomerLayout from './pages/customer/CustomerLayout';
import Home from './pages/customer/Home';
import MenuPage from './pages/customer/MenuPage';
import About from './pages/customer/About';
import Delivery from './pages/customer/Delivery';
import Contact from './pages/customer/Contact';

function App() {
  return (
    <div className="App">
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Customer site */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<Home />} />
              <Route path="etlap" element={<MenuPage />} />
              <Route path="rolunk" element={<About />} />
              <Route path="szallitas" element={<Delivery />} />
              <Route path="kapcsolat" element={<Contact />} />
            </Route>

            {/* Admin panel */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="uj-rendeles" replace />} />
              <Route path="rendelesek" element={<Orders />} />
              <Route path="uj-rendeles" element={<NewOrder />} />
              <Route path="futarok" element={<Couriers />} />
              <Route path="vevok" element={<Customers />} />
              <Route path="etlap" element={<MenuAdmin />} />
              <Route path="keszlet" element={<Inventory />} />
              <Route path="statisztika" element={<Statistics />} />
              <Route path="beallitasok" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </DataProvider>
    </div>
  );
}

export default App;
