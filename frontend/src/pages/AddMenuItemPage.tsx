import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

const AddMenuItemPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image) {
      toast.error("Name, price and image are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);
      await axios.post(`${restaurantService}/api/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item added successfully");
      navigate("/seller/menu");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen">
      <main className="p-8 max-w-5xl mx-auto">
        <nav aria-label="Breadcrumb" className="flex mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link to="/seller/menu" className="hover:text-primary transition-colors">Menu Management</Link></li>
            <li className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-on-surface font-semibold">Add Item</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="font-headline-md text-on-surface">Add New Menu Item</h3>
            <p className="text-gray-500 mt-1">Fill in the details below to add a new culinary masterpiece to your menu.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant block">Item Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-body-md"
                    placeholder="e.g. Signature Truffle Mac & Cheese"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-body-md"
                    placeholder="Describe the flavors, ingredients, and soul of this dish..."
                    rows={4}
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface-variant block">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-body-md font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="font-label-md text-on-surface-variant block">Item Photo</label>
                <label className="border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest p-4 h-[340px] flex flex-col items-center justify-center text-center group hover:border-primary transition-colors cursor-pointer overflow-hidden relative">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-4 text-primary">
                        <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                      </div>
                      <h4 className="font-title-lg text-on-surface">Upload Image</h4>
                      <p className="text-sm text-gray-500 mt-2 px-8">Drag and drop or click to browse.</p>
                    </div>
                  )}

                  {!imagePreview && (
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                      <img alt="Food background placeholder" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdyFFPEZ62v7N-mARrJfylbCb75xTJ-ThuFH8k1AaRWiioSdRkd40Us1AE3xgCKtrz0QK30HP-w3gf6AnX-_QzZA9LihLx4carKceG2i3bG77PYM-EHMtOdGuLUJqM9sJFcIXbu2kk0OeELLK_nyM9H59WT3YG9RNfVgyZb46dU9SdeHu-J8lgMlCDC_ntbEW2VOJY8-N8CDjjrKDEbSW0GfnwneRD6-KYhbc8PugshACDx1EuHHDBmO7EgEmckTF9UTaRPpZYqBZ6" />
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/seller/menu")}
                className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add to Menu'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddMenuItemPage;
