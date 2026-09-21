import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [menu, setMenu] = useState([]);
  const [zones, setZones] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refreshAll = useCallback(async () => {
    const [m, z, c, cu, inv, o] = await Promise.all([
      axios.get(`${API}/menu`).then((r) => r.data),
      axios.get(`${API}/zones`).then((r) => r.data),
      axios.get(`${API}/couriers`).then((r) => r.data),
      axios.get(`${API}/customers`).then((r) => r.data),
      axios.get(`${API}/inventory`).then((r) => r.data),
      axios.get(`${API}/orders`).then((r) => r.data),
    ]);
    setMenu(m); setZones(z); setCouriers(c); setCustomers(cu); setInventory(inv); setOrders(o);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Seed if empty
        const m = await axios.get(`${API}/menu`).then((r) => r.data);
        if (!m || m.length === 0) {
          await axios.post(`${API}/seed`);
        }
        await refreshAll();
      } catch (e) {
        console.error('Init error', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, [refreshAll]);

  // Orders
  const addOrder = async (o) => {
    const { data } = await axios.post(`${API}/orders`, o);
    setOrders((prev) => [data, ...prev]);
    // refresh customers to reflect new upsert
    const cs = await axios.get(`${API}/customers`).then((r) => r.data);
    setCustomers(cs);
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

  // Menu
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

  // Zones
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

  // Couriers
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

  // Inventory
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

  // Customers
  const deleteCustomer = async (id) => {
    await axios.delete(`${API}/customers/${id}`);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const getZoneFee = (zip) => zones.find((z) => z.zip === zip)?.fee ?? 0;

  const value = {
    menu, zones, couriers, customers, inventory, orders, loaded,
    addOrder, updateOrder, deleteOrder,
    addMenuItem, updateMenuItem, deleteMenuItem,
    addZone, updateZone, deleteZone,
    addCourier, updateCourier, deleteCourier,
    addInventory, updateInventory, deleteInventory,
    deleteCustomer,
    getZoneFee,
    refreshAll,
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
