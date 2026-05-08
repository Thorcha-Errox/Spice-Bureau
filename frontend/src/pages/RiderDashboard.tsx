import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import type { IOrder } from "../types";
import audio from "../assets/RiderSound.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import LoadingSpinner from "../components/LoadingSpinner";

interface IRider {
  _id: string;
  name: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
  currentAddress?: string;
}

interface IStats {
  todayEarnings: number;
  weeklyEarnings: number;
  todayDeliveries: number;
  totalOnlineTime: number;
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [stats, setStats] = useState<IStats>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    todayDeliveries: 0,
    totalOnlineTime: 0,
  });
  const [loading, setLoading] = useState(true);

  const [toggling, setToggling] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem("rider_audio_enabled") !== "false"; // Default to true
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);


  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      console.log("New order available notification received:", orderId);
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId]
      );

      if (audioRef.current && audioEnabled) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => console.error("Audio play failed:", err));
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 20000); // Decreased to 20 seconds
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioEnabled]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStats({
        todayEarnings: data?.todayEarnings || 0,
        weeklyEarnings: data?.weeklyEarnings || 0,
        todayDeliveries: data?.todayDeliveries || 0,
        totalOnlineTime: data?.totalOnlineTime || 0,
      });
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data || null);
      if (data) fetchStats();
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchProfile();
      fetchStats();
    } else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const updateLocationSilently = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const address = data.display_name || "Unknown Location";

        await axios.patch(
          `${riderService}/api/rider/location`,
          {
            latitude,
            longitude,
            currentAddress: address,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setProfile((prev) => (prev ? { ...prev, currentAddress: address } : null));
      } catch (error) {
        console.error("Silent location update failed", error);
      }
    }, (err) => console.log("Geolocation error:", err), { enableHighAccuracy: true });
  };

  useEffect(() => {
    if (profile?.isVerified) {
      updateLocationSilently();
    }
  }, [profile?.isVerified]);

  const toggleAvailiblity = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const address = data.display_name || "Unknown Location";

        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailble: !profile?.isAvailble,
            latitude,
            longitude,
            currentAddress: address,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(
          profile?.isAvailble ? "You are offline" : "You are online"
        );
        fetchProfile();
        fetchStats();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update availability");
      } finally {
        setToggling(false);
      }
    }, (err) => {
      console.error(err);
      setToggling(false);
    }, { enableHighAccuracy: true });
  };

  const [riderName, setRiderName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setaadharNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const address = data.display_name || "Unknown Location";

        const formData = new FormData();

        formData.append("name", riderName);
        formData.append("phoneNumber", phoneNumber);
        formData.append("aadharNumber", aadharNumber);
        formData.append("drivingLicenseNumber", drivingLicenseNumber);
        formData.append("latitude", latitude.toString());
        formData.append("longitude", longitude.toString());
        formData.append("currentAddress", address);

        if (image) {
          formData.append("file", image);
        }

        const { data: responseData } = await axios.post(
          `${riderService}/api/rider/new`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(responseData.message);
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to submit profile");
      } finally {
        setSubmitting(false);
      }
    }, (err) => {
      console.error(err);
      setSubmitting(false);
    }, { enableHighAccuracy: true });
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        You are not registered as a rider
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!profile)
    return (
      <div className="bg-surface text-on-surface font-body-md min-h-screen">
        <main className="min-h-screen bg-surface flex flex-col pt-0">
          <div className="flex-1 max-w-[1100px] w-full mx-auto pt-6 md:pt-10 pb-1 px-4 md:px-6 lg:px-8 flex flex-col gap-6 md:gap-10">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-black italic">Add Your Profile</h1>
              <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl mx-auto">Complete your personal information to proceed with your rider application. All fields are required.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col gap-8">
                <section className="bg-white rounded-2xl shadow-sm border border-surface-container-highest p-6 md:p-8 flex flex-col gap-6 h-full">
                  <div className="flex items-center gap-3 pb-4 border-b border-surface-container-highest">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </div>
                    <div>
                      <h2 className="font-title-lg text-on-surface font-bold leading-tight">Profile Photo</h2>
                      <p className="font-label-sm text-on-surface-variant">Visible to customers</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <label className="w-full aspect-square border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                      />
                      {image ? (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                          <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-secondary text-3xl filled">check_circle</span>
                          </div>
                          <p className="font-label-md text-on-surface font-bold text-center px-4 line-clamp-1">{image.name}</p>
                          <p className="text-xs text-secondary mt-1">Image selected successfully</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                          </div>
                          <p className="font-label-md text-on-surface font-semibold">Click to upload photo</p>
                          <p className="font-label-sm text-on-surface-variant mt-1 text-center">SVG, PNG, JPG or GIF (max. 800x800px)</p>
                        </>
                      )}
                    </label>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-7 flex flex-col gap-8">
                <section className="bg-white rounded-2xl shadow-sm border border-surface-container-highest p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden h-full">
                  <div className="flex items-center gap-3 pb-4 border-b border-surface-container-highest">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined">badge</span>
                    </div>
                    <div>
                      <h2 className="font-title-lg text-on-surface font-bold leading-tight">General Information</h2>
                      <p className="font-label-sm text-on-surface-variant">Required for verification</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-label-md text-on-surface-variant ml-1" htmlFor="riderName">Rider Name</label>
                      <input
                        className="w-full bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl font-body-md text-on-surface px-4 py-3 transition-all duration-200 outline-none"
                        id="riderName"
                        placeholder="Enter your full legal name"
                        type="text"
                        value={riderName}
                        onChange={(e) => setRiderName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-on-surface-variant ml-1" htmlFor="contactNumber">Contact Number</label>
                      <input
                        className="w-full bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl font-body-md text-on-surface px-4 py-3 transition-all duration-200 outline-none"
                        id="contactNumber"
                        placeholder="+91 923-456-7891"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-on-surface-variant ml-1" htmlFor="aadharNumber">Aadhar Number</label>
                      <input
                        className="w-full bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl font-body-md text-on-surface px-4 py-3 transition-all duration-200 outline-none"
                        id="aadharNumber"
                        placeholder="12-digit Aadhar number"
                        type="number"
                        value={aadharNumber}
                        onChange={(e) => setaadharNumber(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-label-md text-on-surface-variant ml-1" htmlFor="dlNumber">DL Number</label>
                      <input
                        className="w-full bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl font-body-md text-on-surface px-4 py-3 transition-all duration-200 outline-none"
                        id="dlNumber"
                        placeholder="Enter your Driving License number"
                        type="text"
                        value={drivingLicenseNumber}
                        onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-0 pt-0">
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="px-10 py-3 font-label-md text-label-md rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:opacity-95 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Add Profile"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col no-scrollbar">

      <main className="w-full max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {!profile?.isVerified ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 animate-pulse">
              <span className="material-symbols-outlined text-5xl">verified_user</span>
            </div>

            <h1 className="font-display-lg text-4xl text-on-surface font-black italic mb-4 text-center">Verification in Progress</h1>
            <p className="text-on-surface-variant text-center max-w-lg leading-relaxed text-lg">
              Hello <span className="text-primary font-bold">{profile?.name || 'Rider'}</span>! We've received your profile. Our team is currently reviewing your documents to get you on the road.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {[
                { icon: 'badge', title: 'Document Audit', desc: 'Verifying your DL and ID proof.' },
                { icon: 'fact_check', title: 'Background Sync', desc: 'Running a standard safety check.' },
                { icon: 'task_alt', title: 'Onboarding', desc: 'Activating your rider account.' }
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
                Our verification engine typically takes <span className="text-primary font-bold">24-48 hours</span>. You'll receive a notification as soon as you're cleared to start earning!
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              <div className="md:col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-6 shadow-sm border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <img
                        alt={profile?.name || 'Profile'}
                        className="w-16 h-16 rounded-[1.2rem] object-cover border-4 border-surface-container-lowest shadow-md rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500"
                        src={profile?.picture || ''}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white ${profile?.isAvailble ? 'bg-green-500' : 'bg-outline-variant'}`}></span>
                    </div>
                    <div>
                      <h3 className="font-display-lg text-xl text-on-surface font-black italic tracking-tight">{profile?.name}</h3>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Certified Rider</p>
                        {profile?.currentAddress && (
                          <div className="flex items-center gap-1 text-primary animate-in fade-in slide-in-from-left-2 duration-500">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            <p className="text-[9px] font-bold truncate max-w-[150px]">{profile.currentAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {!currentOrder && (
                      <button
                        onClick={toggleAvailiblity}
                        disabled={toggling}
                        className={`flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group/btn ${profile?.isAvailble ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                      >
                        <span className="font-black text-[10px] uppercase tracking-widest">
                          {toggling ? 'Updating...' : profile?.isAvailble ? 'Online' : 'Offline'}
                        </span>
                        <span className={`material-symbols-outlined text-xl text-white group-hover/btn:scale-110 transition-transform`}>
                          {profile?.isAvailble ? 'online_prediction' : 'power_settings_new'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const newState = !audioEnabled;
                        setAudioEnabled(newState);
                        localStorage.setItem("rider_audio_enabled", newState.toString());
                        toast.success(`Sound notifications ${newState ? 'enabled' : 'disabled'}`);

                        if (newState && audioRef.current) {
                          audioRef.current.play().then(() => {
                            audioRef.current!.pause();
                            audioRef.current!.currentTime = 0;
                          }).catch(() => { });
                        }
                      }}
                      className={`flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group/btn ${audioEnabled ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
                    >
                      <span className="font-black text-[10px] uppercase tracking-widest">
                        Sound {audioEnabled ? 'Active' : 'Muted'}
                      </span>
                      <span className="material-symbols-outlined text-xl text-white group-hover/btn:scale-110 transition-transform">
                        {audioEnabled ? 'volume_up' : 'volume_off'}
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
                        <span className="font-display-lg text-4xl font-black italic tracking-tighter">₹{stats.todayEarnings.toFixed(2)}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                          {stats.todayEarnings > 0 ? '+100%' : '0%'} vs yesterday
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors cursor-default group/stat">
                      <p className="font-black text-[8px] uppercase tracking-[0.2em] text-on-primary/60 mb-1">Weekly</p>
                      <p className="font-display-lg text-lg font-black italic tracking-tight group-hover/stat:scale-105 transition-transform origin-left">₹{stats.weeklyEarnings.toFixed(0)}</p>
                    </div>
                    <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors cursor-default group/stat">
                      <p className="font-black text-[8px] uppercase tracking-[0.2em] text-on-primary/60 mb-1">Deliveries</p>
                      <p className="font-display-lg text-lg font-black italic tracking-tight group-hover/stat:scale-105 transition-transform origin-left">{stats.todayDeliveries}</p>
                    </div>
                    <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md border border-white/5 hover:bg-white/15 transition-colors cursor-default group/stat">
                      <p className="font-black text-[8px] uppercase tracking-[0.2em] text-on-primary/60 mb-1">Active</p>
                      <p className="font-display-lg text-lg font-black italic tracking-tight group-hover/stat:scale-105 transition-transform origin-left">
                        {Math.floor(stats.totalOnlineTime / 60)}h {stats.totalOnlineTime % 60}m
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="flex-1 bg-white rounded-[2.5rem] p-6 shadow-sm border border-outline-variant/10 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-display-lg text-xl text-on-surface font-black italic tracking-tight">
                      {currentOrder ? 'Current Delivery' : 'Queue'}
                    </h3>
                    {incomingOrders.length > 0 && (
                      <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                        <span className="font-black text-[9px] uppercase tracking-widest">{incomingOrders.length} New</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    {profile?.isAvailble && incomingOrders.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {incomingOrders.map((id) => (
                          <RiderOrderRequest
                            key={id}
                            orderId={id}
                            onAccepted={() => {
                              fetchProfile();
                              fetchCurrentOrder();
                              fetchStats();
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {currentOrder ? (
                      <RiderCurrentOrder
                        order={currentOrder}
                        onStatusUpdate={() => {
                          fetchCurrentOrder();
                          fetchStats();
                        }}
                      />
                    ) : (
                      !incomingOrders.length && (
                        <div className="bg-white rounded-[2.5rem] p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-surface-container-low flex items-center justify-center mb-4 text-on-surface-variant/20">
                            <span className="material-symbols-outlined text-4xl">radar</span>
                          </div>
                          <p className="font-display-lg text-lg text-on-surface font-black italic">Scanning Area...</p>
                          <p className="text-[10px] text-on-surface-variant mt-2 font-bold uppercase tracking-widest opacity-60">
                            {profile?.isAvailble ? 'Waiting for ping' : 'Offline Mode'}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col h-full min-h-[450px]">
                <div className="p-6 flex justify-between items-center bg-white/90 backdrop-blur z-10 border-b border-outline-variant/5">
                  <div className="flex items-center gap-4">
                    <h3 className="font-display-lg text-xl text-on-surface font-black italic tracking-tight">Live Navigation</h3>
                    <div className="flex items-center gap-2 bg-secondary/5 px-2 py-1 rounded-full border border-secondary/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-secondary/60">GPS Signal Strong</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative bg-surface-container-low">
                  {currentOrder ? (
                    <RiderOrderMap order={currentOrder} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface/30">
                      <div className="text-center opacity-10">
                        <span className="material-symbols-outlined text-[150px]">map</span>
                        <p className="font-black uppercase tracking-[0.5em] text-2xl">Offline</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RiderDashboard;
