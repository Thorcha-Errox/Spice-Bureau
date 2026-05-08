import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import LoadingSpinner from "../components/LoadingSpinner";

const EditRestaurant = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data: resData } = await axios.get(`${restaurantService}/api/restaurant/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resData.restaurant) {
        setName(resData.restaurant.name);
        setDescription(resData.restaurant.description || "");
        setPhone(resData.restaurant.phone || "");
        setImagePreview(resData.restaurant.image);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load restaurant details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Restaurant name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("phone", phone);
    if (image) {
      formData.append("file", image);
    }

    try {
      setSubmitting(true);
      await axios.put(`${restaurantService}/api/restaurant/edit`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurant Updated successfully");
      navigate("/seller/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen overflow-x-hidden">
      <div className="flex flex-col min-h-screen bg-surface">
        <main className="flex-1 w-full overflow-y-auto">
          <div className="pt-6 md:pt-10 pb-1 px-4 md:px-6 lg:px-8 max-w-[1100px] mx-auto flex flex-col gap-6 md:gap-10">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-black italic">Edit Restaurant Details</h1>
              <p className="font-body-md text-on-surface-variant mt-2 max-w-2xl mx-auto">Update your establishment information and branding</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Image Section */}
              <div className="lg:col-span-5 flex flex-col gap-8">
                <section className="bg-white rounded-2xl shadow-sm border border-surface-container-highest p-6 md:p-8 flex flex-col gap-6 h-full">
                  <div className="flex items-center gap-3 pb-4 border-b border-surface-container-highest">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </div>
                    <div>
                      <h2 className="font-title-lg text-on-surface font-bold leading-tight">Featured Image</h2>
                      <p className="font-label-sm text-on-surface-variant">Update branding</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <label className="w-full aspect-square border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {imagePreview ? (
                        <div className="relative w-full h-full animate-in fade-in zoom-in duration-300">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-white text-4xl">add_a_photo</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                          </div>
                          <p className="font-label-md text-on-surface font-semibold">Click to update image</p>
                        </>
                      )}
                    </label>
                  </div>
                </section>
              </div>

              {/* General Information */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                <section className="bg-white rounded-2xl shadow-sm border border-surface-container-highest p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden h-full">
                  <div className="flex items-center gap-3 pb-4 border-b border-surface-container-highest">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined">badge</span>
                    </div>
                    <div>
                      <h2 className="font-title-lg text-on-surface font-bold leading-tight">General Information</h2>
                      <p className="font-label-sm text-on-surface-variant">Essential details</p>
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
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 mt-8 mb-10">
              <button
                onClick={() => navigate("/seller/dashboard")}
                className="px-10 py-3 font-label-md text-label-md rounded-full text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-all duration-200"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="px-10 py-3 font-label-md text-label-md rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:opacity-95 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Restaurant"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditRestaurant;
