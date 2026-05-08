import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import {
  FiUsers,
  FiTruck,
  FiHome,
  FiTrendingUp,
  FiActivity
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import CustomerCard from "../components/CustomerCard";
import LoadingSpinner from "../components/LoadingSpinner";

const StatCard = ({ title, value, icon: Icon, color, description, badge }: any) => {
  const colorMap: Record<string, { bgLight: string; textCol: string; bgFull: string }> = {
    orange: { bgLight: "bg-orange-50", textCol: "text-orange-600", bgFull: "bg-orange-500" },
    blue:   { bgLight: "bg-blue-50",   textCol: "text-blue-600",   bgFull: "bg-blue-500"   },
    green:  { bgLight: "bg-green-50",  textCol: "text-green-600",  bgFull: "bg-green-500"  },
    purple: { bgLight: "bg-purple-50", textCol: "text-purple-600", bgFull: "bg-purple-500" },
  };

  const { bgLight, textCol, bgFull } = colorMap[color] ?? colorMap["blue"];

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${bgFull}`} />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bgLight} ${textCol} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
        {badge > 0 && (
          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
            {badge} PENDING
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          {description && <span className="text-xs text-slate-400 font-medium">{description}</span>}
        </div>
      </div>
    </div>
  );
};


const Admin = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [allRiders, setAllRiders] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const location = useLocation();

  const isDashboard = location.pathname === "/" || location.pathname === "/admin";
  const isRestaurants = location.pathname === "/admin/restaurants";
  const isRiders = location.pathname === "/admin/riders";
  const isUsers = location.pathname === "/admin/customers";

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const statsRes = await axios.get(`${adminService}/api/v1/admin/stats`, { headers });
      setStats(statsRes.data);

      if (isRestaurants) {
        const res = await axios.get(`${adminService}/api/v1/admin/restaurant/all`, { headers });
        setAllRestaurants(res.data.restaurants);
      }

      if (isRiders) {
        const res = await axios.get(`${adminService}/api/v1/admin/rider/all`, { headers });
        setAllRiders(res.data.riders);
      }

      if (isUsers) {
        const res = await axios.get(`${adminService}/api/v1/admin/customer/all`, { headers });
        setAllCustomers(res.data.customers);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isDashboard ? "System Overview" :
              isRestaurants ? "Restaurant Management" :
                isRiders ? "Rider Management" : "Customer Directory"}
          </h1>
        </div>

        {isDashboard && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2 lg:row-span-2">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] text-white h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4">
                        <FiTrendingUp size={28} className="text-primary" />
                      </div>
                      <h3 className="text-slate-400 font-medium mb-1">Total Revenue</h3>
                      <div className="text-5xl font-black tracking-tighter">
                        ₹{stats?.totalRevenue?.toLocaleString() || "0"}
                      </div>
                      <div className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">
                        from {stats?.totalPaidOrders || "0"} total orders
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="text-slate-400 text-[10px] mb-1 uppercase tracking-wider font-bold">Today's Revenue</div>
                          <div className="text-xl font-bold text-green-400">₹{stats?.todayRevenue?.toLocaleString() || "0"}</div>
                        </div>
                        <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <div className="text-slate-400 text-[10px] mb-1 uppercase tracking-wider font-bold">Today's Orders</div>
                          <div className="text-xl font-bold text-primary">{stats?.todayOrders || "0"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <StatCard
                title="Active Orders"
                value={stats?.activeOrders || "0"}
                icon={FiActivity}
                color="orange"
                description="Live right now"
              />
              <StatCard
                title="Total Restaurants"
                value={stats?.totalRestaurants || "0"}
                icon={FiHome}
                color="blue"
                badge={stats?.pendingRestaurants}
              />
              <StatCard
                title="Active Riders"
                value={stats?.activeRiders || "0"}
                icon={FiTruck}
                color="green"
                description="Riders online"
                badge={stats?.pendingRiders}
              />
              <StatCard
                title="Total Customers"
                value={stats?.totalUsers || "0"}
                icon={FiUsers}
                color="purple"
                description="Registered customers"
              />
            </div>

          </div>
        )}


        {isRestaurants && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm gap-4">
              <div className="flex p-1 bg-slate-50 rounded-2xl">
                {["all", "pending", "verified"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeFilter === f
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="text-slate-400 text-xs font-bold px-2">
                Showing {allRestaurants.filter(r =>
                  activeFilter === "all" ? true :
                    activeFilter === "pending" ? !r.isVerified : r.isVerified
                ).length} Restaurants
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRestaurants
                .filter(r =>
                  activeFilter === "all" ? true :
                    activeFilter === "pending" ? !r.isVerified : r.isVerified
                )
                .map((r) => (
                  <AdminRestaurantCard key={r._id} restaurant={r} onVerify={fetchData} />
                ))}
            </div>

            {allRestaurants.length === 0 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <FiHome size={40} className="opacity-20" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">No Restaurants Found</h2>
                <p className="text-slate-500">Wait for restaurants to join your platform.</p>
              </div>
            )}
          </div>
        )}

        {isRiders && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm gap-4">
              <div className="flex p-1 bg-slate-50 rounded-2xl">
                {["all", "pending", "verified"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeFilter === f
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="text-slate-400 text-xs font-bold px-2">
                Showing {allRiders.filter(r =>
                  activeFilter === "all" ? true :
                    activeFilter === "pending" ? !r.isVerified : r.isVerified
                ).length} Riders
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allRiders
                .filter(r =>
                  activeFilter === "all" ? true :
                    activeFilter === "pending" ? !r.isVerified : r.isVerified
                )
                .map((r) => (
                  <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
                ))}
            </div>

            {allRiders.length === 0 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <FiTruck size={40} className="opacity-20" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">No Riders Found</h2>
                <p className="text-slate-500">Wait for riders to join your network.</p>
              </div>
            )}
          </div>
        )}


        {isUsers && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest px-2">Registered Customers</h2>
              <div className="text-slate-400 text-xs font-bold px-2">
                Total {allCustomers.length} Customers
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCustomers.map((customer) => (
                <CustomerCard key={customer._id} customer={customer} />
              ))}
            </div>

            {allCustomers.length === 0 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <FiUsers size={40} className="opacity-20" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">No Customers Yet</h2>
                <p className="text-slate-500">Your customer directory will appear here as users sign up.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
