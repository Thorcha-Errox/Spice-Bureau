import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface props {
  fetchMyRestaurant: () => Promise<void>;
}

const LocationMarker = ({ setRestaurantLocation, restaurantLocation }: {
  setRestaurantLocation: (loc: any) => void,
  restaurantLocation: any
}) => {
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      await reverseGeocode(lat, lng);
    },
  });

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      const newLoc = {
        latitude: lat,
        longitude: lon,
        formattedAddress: data.display_name || "Custom location",
      };
      setRestaurantLocation(newLoc);
    } catch (error) {
      toast.error("Failed to fetch address");
      setRestaurantLocation({
        latitude: lat,
        longitude: lon,
        formattedAddress: "Custom Location",
      });
    }
  };

  useEffect(() => {
    if (restaurantLocation && map) {
      map.setView([restaurantLocation.latitude, restaurantLocation.longitude], map.getZoom());
    }
  }, [restaurantLocation, map]);

  return restaurantLocation ? (
    <Marker position={[restaurantLocation.latitude, restaurantLocation.longitude]} />
  ) : null;
};

const MapControl = ({ onLocate }: { onLocate: () => void }) => {
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: "10px", marginRight: "10px" }}>
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLocate();
          }}
          className="bg-white p-2 hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Locate Me"
          style={{ width: "34px", height: "34px", border: "none" }}
        >
          <span className="material-symbols-outlined text-primary text-[22px] filled">my_location</span>
        </button>
      </div>
    </div>
  );
};

const AddRestaurant = ({ fetchMyRestaurant }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { location: appLocation } = useAppData();
  const [restaurantLocation, setRestaurantLocation] = useState<any>(null);

  useEffect(() => {
    if (!restaurantLocation) {
      if (appLocation && appLocation.latitude && appLocation.longitude) {
        setRestaurantLocation({
          latitude: appLocation.latitude,
          longitude: appLocation.longitude,
          formattedAddress: appLocation.formattedAddress || "Selected Location",
        });
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await res.json();
              setRestaurantLocation({
                latitude,
                longitude,
                formattedAddress: data.display_name || "Current Location",
              });
            } catch {
              setRestaurantLocation({
                latitude,
                longitude,
                formattedAddress: "Current Location",
              });
            }
          },
          () => {
            setRestaurantLocation({
              latitude: 28.6139,
              longitude: 77.2090,
              formattedAddress: "New Delhi, India",
            });
          }
        );
      } else {
        setRestaurantLocation({
          latitude: 28.6139,
          longitude: 77.2090,
          formattedAddress: "New Delhi, India",
        });
      }
    }
  }, [appLocation, restaurantLocation]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setRestaurantLocation({
            latitude,
            longitude,
            formattedAddress: data.display_name || "My Location",
          });
          toast.success("Location updated to current position");
        } catch (error) {
          setRestaurantLocation({
            latitude,
            longitude,
            formattedAddress: "My Location",
          });
        }
      },
      () => {
        toast.error("Unable to retrieve your location");
        if (!restaurantLocation) {
          setRestaurantLocation({
            latitude: 28.6139,
            longitude: 77.2090,
            formattedAddress: "New Delhi, India",
          });
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!name || !image || !restaurantLocation) {
      toast.error("All fields including location are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(restaurantLocation.latitude));
    formData.append("longitude", String(restaurantLocation.longitude));
    formData.append("formattedAddress", restaurantLocation.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurant Added successfully");
      fetchMyRestaurant();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen overflow-x-hidden">
      <div className="flex flex-col min-h-screen bg-surface">
        <main className="flex-1 w-full overflow-y-auto">
          <div className="pt-6 md:pt-10 pb-1 px-4 md:px-6 lg:px-8 max-w-[1100px] mx-auto flex flex-col gap-6 md:gap-10">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-black italic">Add Your Restaurant</h1>
              <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl mx-auto">Launch your culinary journey with Spice Bureau. Complete your restaurant details to get started.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col gap-8">
                <section className="bg-white rounded-2xl shadow-sm border border-surface-container-highest p-6 md:p-8 flex flex-col gap-6 h-full">
                  <div className="flex items-center gap-3 pb-4 border-b border-surface-container-highest">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </div>
                    <div>
                      <h2 className="font-title-lg text-on-surface font-bold leading-tight">Featured Image</h2>
                      <p className="font-label-sm text-on-surface-variant">The face of your restaurant</p>
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
                          <p className="font-label-sm text-on-surface-variant mt-1 text-center">JPG or PNG preferred</p>
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
                      <p className="font-label-sm text-on-surface-variant">Essential restaurant details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-label-md text-on-surface-variant ml-1" htmlFor="restaurant-name">Restaurant Name</label>
                      <input
                        className="w-full bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl font-body-md text-on-surface px-4 py-3 transition-all duration-200 outline-none"
                        id="restaurant-name"
                        placeholder="e.g., The Food Zone"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-label-md text-on-surface-variant ml-1" htmlFor="contact-number">Contact Number</label>
                      <input
                        className="w-full bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl font-body-md text-on-surface px-4 py-3 transition-all duration-200 outline-none"
                        id="contact-number"
                        placeholder="+91 923-456-7891"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-label-md text-on-surface-variant ml-1" htmlFor="restaurant-description">Restaurant Description</label>
                      <textarea
                        className="w-full bg-surface-container-low border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl font-body-md text-on-surface px-4 py-3 transition-all duration-200 resize-none outline-none"
                        id="restaurant-description"
                        placeholder="Describe your restaurant's atmosphere, specialties..."
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <section className="bg-white rounded-2xl shadow-sm border border-surface-container-highest overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 pb-4 border-b border-surface-container-highest mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <h2 className="font-title-lg text-on-surface font-bold leading-tight">Restaurant Location</h2>
                    <p className="font-label-sm text-on-surface-variant">Primary business address</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl filled">location_on</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-label-md text-on-surface font-bold">Selected Address</p>
                    <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                      {!restaurantLocation ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                          Detecting location...
                        </span>
                      ) : restaurantLocation.formattedAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-80 w-full bg-surface-container-highest relative z-10">
                {restaurantLocation && (
                  <MapContainer
                    center={[restaurantLocation.latitude, restaurantLocation.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                      restaurantLocation={restaurantLocation}
                      setRestaurantLocation={setRestaurantLocation}
                    />
                    <MapControl onLocate={handleLocateMe} />
                  </MapContainer>
                )}
              </div>
            </section>

            <div className="flex justify-center md:justify-end mt-4 mb-10">
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="px-10 py-3 font-label-md text-label-md rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:opacity-95 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto"
              >
                {submitting ? "Launching..." : "Register Restaurant"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddRestaurant;
