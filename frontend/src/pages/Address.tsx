import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { BiLoader, BiTrash, BiCheckCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: string;
  label: string;
  location: {
    coordinates: [number, number];
  };
}

const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    toast.loading("Locating...", { id: "locating" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
        toast.success("Located", { id: "locating" });
      },
      (error) => {
        toast.error(`Denied: ${error.message}`, { id: "locating" });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <button
      onClick={locateUser}
      className="bg-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg text-primary hover:bg-primary/5 transition-all active:scale-90"
    >
      <span className="material-symbols-outlined">my_location</span>
    </button>
  );
};

const AddAddressPage = () => {
  const navigate = useNavigate();
  const { setLocation: setGlobalLocation, setCity: setGlobalCity, location: globalLocation } = useAppData();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [mobile, setMobile] = useState("");
  const [label, setLabel] = useState("Home");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch {
      toast.error("Failed to fetch address");
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAddresses(data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const addAddress = async () => {
    if (!mobile || !formattedAddress || latitude === null || longitude === null) {
      toast.error("Complete all fields");
      return;
    }
    try {
      setAdding(true);
      await axios.post(
        `${restaurantService}/api/address/new`,
        {
          formattedAddress,
          mobile,
          label,
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Address added");
      setMobile("");
      setFormattedAddress("");
      setLatitude(null);
      setLongitude(null);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setAdding(false);
    }
  };

  const deleteAddress = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-primary/5 text-primary rounded-full">
            <BiTrash size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Delete Address?</p>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                setDeletingId(id);
                await axios.delete(`${restaurantService}/api/address/${id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });
                toast.success("Address deleted successfully");
                fetchAddresses();
              } catch {
                toast.error("Failed to delete address");
              } finally {
                setDeletingId(null);
              }
            }}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 6000, position: 'bottom-center' });
  };

  const handleAddressSelect = (addr: Address) => {
    const [lng, lat] = addr.location.coordinates;

    setGlobalLocation({
      latitude: lat,
      longitude: lng,
      formattedAddress: addr.formattedAddress,
    });

    const parts = addr.formattedAddress.split(",");
    const city = parts[parts.length - 3]?.trim() || addr.label;
    setGlobalCity(city);

    toast.success(`Active location: ${addr.label}`);


    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  const isActive = (addr: Address) => {
    if (!globalLocation) return false;
    const [lng, lat] = addr.location.coordinates;
    return (
      Math.abs(globalLocation.latitude - lat) < 0.0001 &&
      Math.abs(globalLocation.longitude - lng) < 0.0001
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans'] antialiased pb-20">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Addresses</h1>
            <p className="text-sm text-slate-500 font-medium">Add or select your delivery location</p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bookmark</span>
              Saved Places
            </h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {addresses.length} Addresses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
              ))
            ) : addresses.length === 0 ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-2">location_off</span>
                <p className="font-bold">No saved addresses yet</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => handleAddressSelect(addr)}
                  className={`relative group cursor-pointer p-5 bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isActive(addr)
                    ? "border-primary shadow-md ring-4 ring-primary/5"
                    : "border-slate-100 hover:border-primary/30 shadow-sm"
                    }`}
                >
                  {isActive(addr) && (
                    <div className="absolute -top-3 -right-3 bg-primary text-white p-1 rounded-full shadow-lg border-4 border-white animate-bounce-short">
                      <BiCheckCircle size={20} />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-colors ${isActive(addr) ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary"
                      }`}>
                      <span className="material-symbols-outlined filled">
                        {addr.label === "Home" ? "home" : addr.label === "Work" ? "work" : "explore"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">{addr.label}</h3>
                        <button
                          onClick={(e) => deleteAddress(e, addr._id)}
                          disabled={deletingId === addr._id}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          {deletingId === addr._id ? <BiLoader className="animate-spin" /> : <BiTrash size={18} />}
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {addr.formattedAddress}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile</span>
                        <span className="text-xs font-bold text-slate-700">{addr.mobile}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16" />

          <div className="relative z-10">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined filled">add_location_alt</span>
              </span>
              Add New Address
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">Place Type</label>
                  <div className="flex gap-3">
                    {["Home", "Work", "Other"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLabel(l)}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${label === l
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                          }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {l === "Home" ? "home" : l === "Work" ? "work" : "explore"}
                        </span>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">Contact Number</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">call</span>
                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:bg-white focus:border-primary/20 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border-2 transition-all ${formattedAddress ? "bg-primary/5 border-primary/10" : "bg-slate-50 border-slate-50"}`}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Selected Location</label>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed min-h-[40px]">
                    {formattedAddress || "Tap on the map to pin your location"}
                  </p>
                </div>

                <button
                  disabled={adding || !formattedAddress || !mobile}
                  onClick={addAddress}
                  className="w-full bg-primary hover:opacity-90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 text-lg"
                >
                  {adding ? (
                    <BiLoader className="animate-spin text-2xl" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined">task_alt</span>
                      Confirm & Save
                    </>
                  )}
                </button>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                <div className="relative h-[400px] lg:h-full min-h-[400px] rounded-[2rem] overflow-hidden border-4 border-white shadow-inner">
                  <MapContainer
                    center={[latitude || 28.6139, longitude || 77.209]}
                    zoom={13}
                    className="h-full w-full z-0"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <LocationPicker setLocation={handleMapClick} />
                    {latitude && longitude && (
                      <Marker position={[latitude, longitude]} />
                    )}
                    <div className="absolute right-6 bottom-6 z-[1000]">
                      <LocateMeButton onLocate={handleMapClick} />
                    </div>
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short {
          animation: bounce-short 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AddAddressPage;
