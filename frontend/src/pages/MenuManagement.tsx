import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { restaurantService } from "../main";
import type { IMenuItem } from "../types";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data: resData } = await axios.get(`${restaurantService}/api/restaurant/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resData.restaurant) {
        navigate("/");
        return;
      }


      const itemsRes = await axios.get(`${restaurantService}/api/item/all/${resData.restaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMenuItems(itemsRes.data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAvailability = async (itemId: string) => {
    try {
      await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMenuItems(prev =>
        prev.map(item =>
          item._id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
        )
      );
      toast.success("Availability updated");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const deleteItem = async (itemId: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          <span className="font-bold text-on-surface">Delete Item?</span>
        </div>
        <p className="text-xs text-on-surface-variant">Are you sure you want to delete this menu item? This action cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`${restaurantService}/api/item/${itemId}`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setMenuItems(prev => prev.filter(item => item._id !== itemId));
                toast.success("Item deleted successfully");
              } catch (error) {
                toast.error("Failed to delete item");
              }
            }}
            className="px-3 py-1.5 text-xs font-bold bg-error text-white rounded-lg shadow-lg shadow-error/20 hover:opacity-90 transition-all"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        borderRadius: '16px',
        background: '#fff',
        color: '#333',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f1f5f9',
        padding: '12px'
      }
    });
  };


  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="bg-surface font-body-md text-on-background antialiased min-h-screen no-scrollbar">
      <main className="max-w-7xl mx-auto pt-8 px-8 pb-12 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Menu Management</h2>
            <p className="font-body-md text-slate-500">Organize your offerings and manage availability in real-time.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/seller/add-item" className="px-6 py-2.5 bg-primary text-white font-label-md rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              Add Item
            </Link>
          </div>
        </div>

        {menuItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-2xl text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">restaurant</span>
            <h3 className="font-title-lg text-on-surface mb-2">No items in your menu</h3>
            <p className="text-slate-500 mb-6">Start by adding your first culinary masterpiece.</p>
            <Link to="/seller/add-item" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
              Add your first item <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div key={item._id} className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex gap-4 hover:shadow-md transition-shadow ${!item.isAvailable && 'opacity-75 grayscale-[0.5]'}`}>
                <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative">
                  <img className="w-full h-full object-cover" alt={item.name} src={item.image} />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-red-600 px-2 py-1 rounded">Offline</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-title-lg text-title-lg ${item.isAvailable ? 'text-on-surface' : 'text-slate-400'}`}>{item.name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => deleteItem(item._id)} className="p-1.5 text-slate-400 hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                  <p className={`text-label-sm line-clamp-2 mb-3 ${item.isAvailable ? 'text-slate-500' : 'text-slate-400'}`}>{item.description}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className={`font-display-lg text-2xl font-black italic tracking-tighter ${item.isAvailable ? 'text-primary' : 'text-slate-400'}`}>₹{item.price}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-label-sm text-slate-400">{item.isAvailable ? 'Available' : 'Offline'}</span>
                      <div className="relative inline-block w-10 h-6 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={() => toggleAvailability(item._id)}
                          className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out ${item.isAvailable ? 'translate-x-4 border-primary' : 'border-slate-300'}`}
                        />
                        <label className={`block overflow-hidden h-6 rounded-full cursor-pointer ${item.isAvailable ? 'bg-primary-container' : 'bg-slate-200'}`}></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default MenuManagement;
