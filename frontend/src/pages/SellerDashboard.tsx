import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { restaurantService } from "../main";
import { useAppData } from "../context/AppContext";
import type { IOrder, IRestaurant } from "../types";
import { useSocket } from "../context/SocketContext";
import audioFile from "../assets/RestaurantSound.mp3";
import toast from "react-hot-toast";
import OrderCard from "../components/OrderCard";
import LoadingSpinner from "../components/LoadingSpinner";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
];

const SellerDashboard = () => {
  const { user, setIsVerified: setGlobalVerified } = useAppData();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(() => {
    return localStorage.getItem("seller_audio_unlocked") === "true";
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    audioRef.current = new Audio(audioFile);
    audioRef.current.load();
  }, []);

  const toggleSound = () => {
    if (!audioUnlocked) {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          setAudioUnlocked(true);
          localStorage.setItem("seller_audio_unlocked", "true");
          toast.success("Sound notifications enabled");
        }).catch(err => console.log("Failed to unlock audio: ", err));
      }
    } else {
      setAudioUnlocked(false);
      localStorage.setItem("seller_audio_unlocked", "false");
      toast.success("Sound notifications disabled");
    }
  };

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

      setRestaurant(resData.restaurant);
      setGlobalVerified(resData.restaurant.isVerified);

      const { data: ordersRes } = await axios.get(`${restaurantService}/api/order/restaurant/${resData.restaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(ordersRes.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNewOrder = () => {
      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => console.error("Audio play failed:", err));
      }
      fetchData();
    };

    socket.on("order:new", onNewOrder);
    socket.on("order:rider_assigned", fetchData);

    return () => {
      socket.off("order:new", onNewOrder);
      socket.off("order:rider_assigned", fetchData);
    };
  }, [socket, audioUnlocked]);

  const toggleStoreStatus = async () => {
    if (!restaurant) return;
    try {
      setIsUpdatingStatus(true);
      const newStatus = !restaurant.isOpen;
      await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setRestaurant({ ...restaurant, isOpen: !restaurant.isOpen });
      toast.success(`Store is now ${!restaurant.isOpen ? "Open" : "Closed"}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const activeOrderToShow = orders
    .filter((o) => ACTIVE_STATUSES.includes(o.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

  const newRequestsCount = orders.filter(o => o.status === 'placed').length;
  const pendingCount = orders.filter(o => ['rider_assigned', 'picked_up'].includes(o.status)).length;

  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status) && !['rider_assigned', 'picked_up'].includes(o.status)).slice(0, 3);


  const todayRevenue = orders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);


  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col no-scrollbar">
      <main className="w-full max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {!restaurant?.isVerified ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 animate-pulse">
              <span className="material-symbols-outlined text-5xl">verified_user</span>
            </div>

            <h1 className="font-display-lg text-4xl text-on-surface font-black italic mb-4 text-center">Verification in Progress</h1>
            <p className="text-on-surface-variant text-center max-w-lg leading-relaxed text-lg">
              Welcome to Spice Bureau! Your restaurant, <span className="text-primary font-bold">{restaurant?.name || 'Restaurant'}</span>, is currently being reviewed by our team.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {[
                { icon: 'description', title: 'Reviewing Details', desc: 'Checking your restaurant info.' },
                { icon: 'location_on', title: 'Location Check', desc: 'Verifying your store address.' },
                { icon: 'task_alt', title: 'Final Approval', desc: 'Granting you full access to the portal.' }
              ].map((step, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-surface-variant/30 shadow-sm text-center group hover:border-primary/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-surface mx-auto mb-4 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="font-bold text-on-surface text-base mb-2">{step.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed px-2">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4 max-w-2xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">schedule</span>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">
                Our verification engine typically takes <span className="text-primary font-bold">24-48 hours</span>. You'll receive a notification as soon as you're cleared to start selling!
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              <div className="md:col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-6 shadow-sm border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-[1.2rem] bg-surface-container flex items-center justify-center border-4 border-surface-container-lowest shadow-md rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                          <img
                            alt={restaurant?.name}
                            src={restaurant?.image || ''}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white ${restaurant?.isOpen ? 'bg-green-500' : 'bg-outline-variant'}`}></span>
                      </div>
                      <div>
                        <h3 className="font-display-lg text-xl text-on-surface font-black italic tracking-tight">{restaurant?.name}</h3>
                        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Certified Merchant</p>
                      </div>
                    </div>
                    <Link to="/seller/edit-restaurant" className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined text-xl">edit_note</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={toggleStoreStatus}
                      disabled={isUpdatingStatus}
                      className={`flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group/btn ${restaurant?.isOpen ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                    >
                      <span className="font-black text-[10px] uppercase tracking-widest">
                        {isUpdatingStatus ? 'Updating...' : restaurant?.isOpen ? 'Store Open' : 'Store Closed'}
                      </span>
                      <span className={`material-symbols-outlined text-xl transition-transform group-hover/btn:scale-110`}>
                        {restaurant?.isOpen ? 'storefront' : 'store'}
                      </span>
                    </button>

                    <button
                      onClick={toggleSound}
                      className={`flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group/btn ${audioUnlocked ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                    >
                      <span className="font-black text-[10px] uppercase tracking-widest">
                        Sound {audioUnlocked ? 'Active' : 'Muted'}
                      </span>
                      <span className="material-symbols-outlined text-xl transition-transform group-hover/btn:scale-110">
                        {audioUnlocked ? 'notifications_active' : 'notifications_off'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-8 bg-primary text-on-primary rounded-[2.5rem] p-6 shadow-xl shadow-primary/10 relative overflow-hidden bg-gradient-to-br from-[#b7102a] via-[#db313f] to-[#e23744]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-display-lg text-sm text-on-primary/70 font-black italic uppercase tracking-widest mb-1">Total Revenue</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display-lg text-4xl font-black italic tracking-tighter">₹{todayRevenue.toFixed(2)}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                          Today's Earnings
                        </span>
                      </div>

                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors cursor-default group/stat">
                      <p className="font-black text-[8px] uppercase tracking-[0.2em] text-on-primary/60 mb-1">Total</p>
                      <p className="font-display-lg text-lg font-black italic tracking-tight group-hover/stat:scale-105 transition-transform origin-left">₹{totalRevenue.toFixed(0)}</p>
                    </div>
                    <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors cursor-default group/stat">
                      <p className="font-black text-[8px] uppercase tracking-[0.2em] text-on-primary/60 mb-1">Orders Today</p>
                      <p className="font-display-lg text-lg font-black italic tracking-tight group-hover/stat:scale-105 transition-transform origin-left">{orders.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors cursor-default group/stat">
                      <p className="font-black text-[8px] uppercase tracking-[0.2em] text-on-primary/60 mb-1">Status</p>
                      <p className="font-display-lg text-lg font-black italic tracking-tight group-hover/stat:scale-105 transition-transform origin-left">
                        {restaurant?.isOpen ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
                <div className="flex-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl filled">electric_bolt</span>
                      </div>
                      <div>
                        <h3 className="font-display-lg text-2xl text-on-surface font-black italic tracking-tight">Active Orders</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Real-time management</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {newRequestsCount > 0 && (
                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          <span className="font-black text-[10px] uppercase tracking-widest">{newRequestsCount} New Requests</span>
                        </div>
                      )}
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full border border-secondary/20">
                          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                          <span className="font-black text-[10px] uppercase tracking-widest">{pendingCount} Pending</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {!activeOrderToShow ? (
                      <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-surface-container-low flex items-center justify-center mb-6 text-on-surface-variant/20">
                          <span className="material-symbols-outlined text-5xl">restaurant</span>
                        </div>
                        <h4 className="font-display-lg text-xl text-on-surface font-black italic">Kitchen is Quiet</h4>
                        <p className="text-sm text-on-surface-variant mt-2 max-w-xs mx-auto">
                          {pendingCount > 0
                            ? `You have ${pendingCount} orders being delivered by riders. No new kitchen tasks!`
                            : "No active orders at the moment. We'll alert you as soon as a new order arrives!"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        <OrderCard order={activeOrderToShow} onStatusUpdate={fetchData} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="bg-secondary/5 rounded-[2.5rem] p-6 border border-secondary/10">
                  <h4 className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-4">Quick Shortcuts</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/seller/add-item" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-secondary/5 hover:border-secondary/20 transition-all group">
                      <span className="material-symbols-outlined text-secondary mb-2 group-hover:scale-110 transition-transform">add_circle</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-on-surface">Add Item</span>
                    </Link>
                    <Link to="/seller/menu" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-secondary/5 hover:border-secondary/20 transition-all group">
                      <span className="material-symbols-outlined text-secondary mb-2 group-hover:scale-110 transition-transform">menu_book</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-on-surface">Menu</span>
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-outline-variant/10 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display-lg text-xl text-on-surface font-black italic tracking-tight">Recent History</h3>
                    <Link
                      to="/seller/orders"
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {completedOrders.length === 0 ? (
                      <div className="py-12 text-center opacity-40">
                        <span className="material-symbols-outlined text-4xl mb-2">history</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">No history yet</p>
                      </div>
                    ) : (
                      completedOrders.map(order => (
                        <div key={order._id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/5 group hover:border-primary/20 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                              <span className="material-symbols-outlined text-xl filled">check_circle</span>
                            </div>
                            <div>
                              <p className="font-black italic text-sm text-on-surface">#{order._id.slice(-6).toUpperCase()}</p>
                              <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <p className="font-display-lg text-lg text-on-surface font-black italic tracking-tighter">₹{order.totalAmount}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
