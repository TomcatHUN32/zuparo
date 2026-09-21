import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user, ready } = useAuth();
  const [menu, setMenu] = useState([]);
  const [zones, setZones] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadPublic = useCallback(async () => {
    const [m, z, c, cp] = await Promise.all([
      axios.get(`${API}/menu`).then((r) => r.data).catch(() => []),
      axios.get(`${API}/zones`).then((r) => r.data).catch(() => []),
      axios.get(`${API}/couriers`).then((r) => r.data).catch(() => []),
      axios.get(`${API}/coupons`).then((r) => r.data).catch(() => []),
    ]);
    setMenu(m); setZones(z); setCouriers(c); setCoupons(cp);
  }, []);

  const loadAdmin = useCallback(async () => {
    const [cu, inv, o] = await Promise.all([
      axios.get(`${API}/customers`).then((r) => r.data).catch(() => []),
      axios.get(`${API}/inventory`).then((r) => r.data).catch(() => []),
      axios.get(`${API}/orders`).then((r) => r.data).catch(() => []),
    ]);
    setCustomers(cu); setInventory(inv); setOrders(o);
  }, []);

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        // Try to seed if empty
        const m = await axios.get(`${API}/menu`).then((r) => r.data);
        if (!m || m.length === 0) await axios.post(`${API}/seed`);
        await loadPublic();
        if (user?.role === 'admin') await loadAdmin();
      } catch (e) {
        console.error('Data init error', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, [ready, user, loadPublic, loadAdmin]);

  // -------- Orders --------
  const addOrder = async (o) => {
    const { data } = await axios.post(`${API}/orders`, o);
    setOrders((prev) => [data, ...prev]);
    if (user?.role === 'admin') {
      const cs = await axios.get(`${API}/customers`).then((r) => r.data).catch(() => []);
      setCustomers(cs);
    }
    return data;
  };
  const updateOrder = async (id, patch) => {
    const { data } = await axios.put(`${API}/orders/${id}`, patch);
    setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
  };
  const deleteOrder = async (id) => {
    await axios.delete(`${API}/orders/${id}`);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // -------- Menu --------
  const addMenuItem = async (item) => {
    const { data } = await axios.post(`${API}/menu`, item);
    setMenu((prev) => [data, ...prev]);
  };
  const updateMenuItem = async (id, patch) => {
    const { data } = await axios.put(`${API}/menu/${id}`, patch);
    setMenu((prev) => prev.map((m) => (m.id === id ? data : m)));
  };
  const deleteMenuItem = async (id) => {
    await axios.delete(`${API}/menu/${id}`);
    setMenu((prev) => prev.filter((m) => m.id !== id));
  };

  // -------- Zones --------
  const addZone = async (z) => {
    const { data } = await axios.post(`${API}/zones`, z);
    setZones((prev) => [data, ...prev]);
  };
  const updateZone = async (id, patch) => {
    const { data } = await axios.put(`${API}/zones/${id}`, patch);
    setZones((prev) => prev.map((z) => (z.id === id ? data : z)));
  };
  const deleteZone = async (id) => {
    await axios.delete(`${API}/zones/${id}`);
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  // -------- Couriers --------
  const addCourier = async (c) => {
    const { data } = await axios.post(`${API}/couriers`, { ...c, active: true });
    setCouriers((prev) => [data, ...prev]);
  };
  const updateCourier = async (id, patch) => {
    const { data } = await axios.put(`${API}/couriers/${id}`, patch);
    setCouriers((prev) => prev.map((c) => (c.id === id ? data : c)));
  };
  const deleteCourier = async (id) => {
    await axios.delete(`${API}/couriers/${id}`);
    setCouriers((prev) => prev.filter((c) => c.id !== id));
  };

  // -------- Inventory --------
  const addInventory = async (it) => {
    const { data } = await axios.post(`${API}/inventory`, it);
    setInventory((prev) => [data, ...prev]);
  };
  const updateInventory = async (id, patch) => {
    const { data } = await axios.put(`${API}/inventory/${id}`, patch);
    setInventory((prev) => prev.map((i) => (i.id === id ? data : i)));
  };
  const deleteInventory = async (id) => {
    await axios.delete(`${API}/inventory/${id}`);
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  // -------- Customers --------
  const deleteCustomer = async (id) => {
    await axios.delete(`${API}/customers/${id}`);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // -------- Coupons --------
  const addCoupon = async (c) => {
    const { data } = await axios.post(`${API}/coupons`, c);
    setCoupons((prev) => [data, ...prev]);
  };
  const updateCoupon = async (id, patch) => {
    const { data } = await axios.put(`${API}/coupons/${id}`, patch);
    setCoupons((prev) => prev.map((c) => (c.id === id ? data : c)));
  };
  const deleteCoupon = async (id) => {
    await axios.delete(`${API}/coupons/${id}`);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };
  const validateCoupon = async (code) => {
    const { data } = await axios.post(`${API}/coupons/validate`, { code });
    return data;
  };

  const getZoneFee = (zip) => zones.find((z) => z.zip === zip)?.fee ?? 0;

  return (
    <DataContext.Provider value={{
      menu, zones, couriers, customers, inventory, orders, coupons, loaded,
      addOrder, updateOrder, deleteOrder,
      addMenuItem, updateMenuItem, deleteMenuItem,
      addZone, updateZone, deleteZone,
      addCourier, updateCourier, deleteCourier,
      addInventory, updateInventory, deleteInventory,
      deleteCustomer,
      addCoupon, updateCoupon, deleteCoupon, validateCoupon,
      getZoneFee,
      reloadPublic: loadPublic, reloadAdmin: loadAdmin,
    }}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
