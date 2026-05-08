import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";
import LoadingSpinner from "../components/LoadingSpinner";

type Role = "customer" | "rider" | "seller" | null;
const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const addRole = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);

      navigate("/", { replace: true });
    } catch (error) {
      alert("something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {loading && <LoadingSpinner fullScreen />}
      <header className="bg-white/90 backdrop-blur-md font-['Plus_Jakarta_Sans'] antialiased sticky top-0 z-50 border-b border-slate-100 shadow-sm flex justify-between items-center w-full px-6 h-16">
        <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined text-primary text-[24px] md:text-[28px] filled">local_fire_department</span>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-[#b7102a] italic">Spice Bureau</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">
            Choose your role
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Select how you want to use Spice Bureau to get started.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          <div
            onClick={() => setRole("customer")}
            className="cursor-pointer relative group"
          >
            <div
              className={`bg-surface rounded-xl p-8 border-2 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col items-center text-center h-full ${role === "customer"
                ? "border-primary bg-primary-container/10"
                : "border-transparent hover:border-outline-variant"
                }`}
            >
              <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-4xl text-primary">
                  restaurant_menu
                </span>
              </div>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-2">
                Customer
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Order delicious meals from your favorite local restaurants.
              </p>
            </div>
          </div>

          <div
            onClick={() => setRole("rider")}
            className="cursor-pointer relative group"
          >
            <div
              className={`bg-surface rounded-xl p-8 border-2 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col items-center text-center h-full ${role === "rider"
                ? "border-primary bg-primary-container/10"
                : "border-transparent hover:border-outline-variant"
                }`}
            >
              <div className="w-20 h-20 rounded-full bg-secondary-container/30 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-4xl text-secondary">
                  two_wheeler
                </span>
              </div>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-2">
                Rider
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Deliver orders and earn money on your own schedule.
              </p>
            </div>
          </div>

          <div
            onClick={() => setRole("seller")}
            className="cursor-pointer relative group"
          >
            <div
              className={`bg-surface rounded-xl p-8 border-2 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col items-center text-center h-full ${role === "seller"
                ? "border-primary bg-primary-container/10"
                : "border-transparent hover:border-outline-variant"
                }`}
            >
              <div className="w-20 h-20 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-4xl text-tertiary">
                  storefront
                </span>
              </div>
              <h2 className="font-title-lg text-title-lg text-on-surface mb-2">
                Seller
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Manage your restaurant, menus, and grow your business.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto flex justify-center">
          <button
            onClick={addRole}
            disabled={!role || loading}
            className={`font-label-md text-label-md py-4 px-12 rounded-full w-full transition-all duration-200 flex items-center justify-center min-h-[56px] ${role
              ? "bg-primary text-on-primary hover:bg-surface-tint shadow-sm cursor-pointer"
              : "bg-surface-variant text-on-surface-variant cursor-not-allowed"
              }`}
          >
            {loading ? "Processing..." : "Next"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default SelectRole;
