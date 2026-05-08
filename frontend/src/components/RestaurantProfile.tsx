import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiSave } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const { setIsAuth, setUser } = useAppData();

  const logoutHandler = async () => {
    await axios.put(
      `${restaurantService}/api/restaurant/status`,
      { status: false },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged Out successfully");
  };
  return (
    <div className="bg-surface-container-lowest p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
      <div className="relative group">
        <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white shadow-level-2 bg-surface-container-low transition-transform duration-500 group-hover:scale-[1.02]">
          <img
            src={restaurant.image || "https://via.placeholder.com/150"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-secondary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
          Featured
        </div>
      </div>

      <div className="flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-wrap items-center gap-3">
              {editMode ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-headline-lg text-3xl text-on-surface bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none w-full"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-lg text-3xl md:text-4xl text-on-surface tracking-tight">
                    {restaurant.name}
                  </h1>
                  {restaurant.isVerified && (
                    <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                  )}
                </div>
              )}

              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-widest ${isOpen
                  ? "bg-secondary/10 text-secondary border border-secondary/20"
                  : "bg-error/10 text-error border border-error/20"
                  }`}
              >
                <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-secondary animate-pulse" : "bg-error"}`} />
                {isOpen ? "Currently Open" : "Closed Now"}
              </span>

              {isSeller && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="text-on-surface-variant hover:text-primary transition-all p-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30"
                >
                  <BiEdit size={22} />
                </button>
              )}
            </div>

            {editMode ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full font-body-md text-on-surface-variant bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                rows={3}
              />
            ) : (
              <p className="font-body-md text-on-surface-variant leading-relaxed max-w-2xl">
                {restaurant.description || "Indulge in a symphony of flavors at Spice Bureau, where every dish is a masterpiece crafted with heritage spices and modern culinary techniques."}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 min-w-[180px] w-full sm:w-auto p-5 rounded-3xl bg-surface-container-low/50 border border-outline-variant/20">
            <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Location</span>
                <span className="text-sm font-semibold text-on-surface truncate max-w-[120px]">
                  {restaurant.autoLocation.formattedAddress?.split(',')[0] || "Downtown Area"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Delivery Time</span>
                <span className="text-sm font-semibold text-on-surface">{restaurant.deliveryTime || "25-35 mins"}</span>
              </div>
            </div>
          </div>
        </div>

        {isSeller && (
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-outline-variant/10">
            {editMode && (
              <button
                onClick={saveChanges}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                <BiSave size={20} />
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            )}
            <button
              onClick={toggleOpenStatus}
              className={`px-6 py-2.5 rounded-full font-bold text-sm text-white transition-all shadow-sm ${isOpen
                ? "bg-error hover:bg-error/90 hover:shadow-error/20"
                : "bg-secondary hover:bg-secondary/90 hover:shadow-secondary/20"
                }`}
            >
              {isOpen ? "Mark as Closed" : "Mark as Open"}
            </button>
            <button
              onClick={logoutHandler}
              className="px-6 py-2.5 rounded-full font-bold text-sm bg-on-surface text-surface hover:opacity-95 transition-all ml-auto"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantProfile;
