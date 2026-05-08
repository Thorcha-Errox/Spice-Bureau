import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import LoadingSpinner from "../components/LoadingSpinner";

const RestaurantPage = () => {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!restaurant) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">No Restaurant with this id</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col antialiased font-body-md text-body-md">
      <main className="flex-grow pb-12">
        <section className="relative w-full h-[320px] md:h-[450px] overflow-hidden group">
          <img
            className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000"}
            alt="Restaurant Cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-transparent"></div>
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white font-label-md">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Spice Bureau Premium Partner
          </div>
        </section>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 -mt-20 md:-mt-32 z-10 mb-12">
          <div className="rounded-3xl overflow-hidden shadow-level-3 border border-outline-variant/30 backdrop-blur-xl bg-white/90 dark:bg-on-surface/90">
            <RestaurantProfile
              restaurant={restaurant}
              onUpdate={setRestaurant}
              isSeller={false}
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-8 rounded-full bg-primary animate-pulse" />
                <h2 className="font-headline-lg text-3xl text-on-surface">Explore Menu</h2>
              </div>
              <p className="text-on-surface-variant font-body-md">Handpicked dishes from {restaurant.name}'s kitchen</p>
            </div>
          </div>

          <div className="bg-surface-container-low/30 p-6 rounded-[2rem] border border-outline-variant/10">
            <MenuItems
              isSeller={false}
              items={menuItems}
              onItemDeleted={() => { }}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default RestaurantPage;
