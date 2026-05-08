import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";

const Home = () => {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${restaurantService}/api/restaurant/all`, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          search,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  if (loading || !location) {
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
        {/* Skeleton Hero */}
        <div className="w-full h-48 md:h-64 bg-surface-container rounded-[2.5rem] animate-pulse mb-8"></div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-[4/5] bg-surface-container rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 pb-32 md:pb-12 animate-in fade-in duration-700">

      {/* Hero Section - Bento Style */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 md:p-12 text-on-primary shadow-xl shadow-primary/10 bg-gradient-to-br from-[#b7102a] via-[#db313f] to-[#e23744]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display-lg text-4xl md:text-6xl font-black italic tracking-tighter leading-tight mb-4">
              Spice Up Your <br /> Everyday Life.
            </h1>
            <p className="font-body-lg text-on-primary/80 mb-8 max-w-md">
              Discover the finest flavors from Spice Bureau's handpicked restaurants, delivered straight to your door.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined filled text-white">bolt</span>
                <span className="font-black text-sm uppercase tracking-widest">Fast Delivery</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined filled text-white">verified</span>
                <span className="font-black text-sm uppercase tracking-widest">Top Rated</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Main Content Section */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-display-lg text-3xl font-black italic tracking-tight text-on-surface">
              {search ? `Results for "${search}"` : "Handpicked for You"}
            </h2>
            {/* <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.2em] mt-1 opacity-60">
              {restaurants.length} Premium Spots Found
            </p> */}
          </div>
        </div>

        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((res) => {
              const [resLng, resLat] = res.autoLocation.coordinates;
              const distance = getDistanceKm(location.latitude, location.longitude, resLat, resLng);

              return (
                <div key={res._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <RestaurantCard
                    id={res._id}
                    name={res.name}
                    description={res.description}
                    image={res.image ?? ""}
                    distance={`${distance}`}
                    isOpen={res.isOpen}
                    deliveryTime={res.deliveryTime}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-outline-variant/10 border-dashed">
            <div className="w-20 h-20 rounded-3xl bg-surface flex items-center justify-center text-on-surface-variant/20 mb-6">
              <span className="material-symbols-outlined text-5xl">search_off</span>
            </div>
            <h3 className="font-display-lg text-xl font-black italic text-on-surface">No flavors found</h3>
            <p className="text-on-surface-variant text-sm mt-2 font-medium">Try searching for something else</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;
