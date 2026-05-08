import { useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { authService } from "../main";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProfileDetails = () => {
  const { user, setUser } = useAppData();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [image, setImage] = useState(user?.image || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/update`,
        { name, phone, image },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser(data.user);
      localStorage.setItem("token", data.token);
      toast.success(data.message);
      navigate("/account");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }

  };


  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] font-['Be_Vietnam_Pro'] text-base min-h-screen flex flex-col antialiased">
      {loading && <LoadingSpinner fullScreen />}
      <main className="flex-grow pb-16 px-4 md:px-8 max-w-4xl mx-auto w-full flex flex-col items-center pt-8">
        <section className="flex-grow w-full">
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-[#f3f4f5]">
            <div className="px-6 py-8 border-b border-[#e1e3e4] bg-[#f8f9fa]">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#191c1d]">Public Profile</h2>
              <p className="text-[#5b403f] mt-2 text-sm">Manage your account details and how you appear across the Spice Bureau platform.</p>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById("avatar-input")?.click()}>
                  <div className="w-24 h-24 rounded-full bg-[#e7e8e9] overflow-hidden shadow-sm ring-4 ring-white relative z-10 flex items-center justify-center">
                    <img
                      alt="User avatar"
                      className="w-full h-full object-cover"
                      src={image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-lg text-[#191c1d]">Profile Picture</h3>
                  <p className="text-sm text-[#5b403f]">JPG, GIF or PNG. 1MB max.</p>
                  <div className="flex gap-3 mt-2">
                    <input
                      type="file"
                      id="avatar-input"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("avatar-input")?.click()}
                      className="px-4 py-2 bg-[#edeeef] border border-[#e4bebc] text-[#191c1d] rounded-lg text-sm font-semibold hover:bg-[#e7e8e9] transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setImage("https://cdn-icons-png.flaticon.com/512/149/149071.png")}
                      className="px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>


              <div className="h-px w-full bg-[#e1e3e4]"></div>

              <form className="space-y-6" onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#191c1d]" htmlFor="fullName">Full Name</label>
                    <input
                      className="w-full bg-[#f3f4f5] border-none text-[#191c1d] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#b7102a] focus:bg-white transition-colors placeholder:text-[#5b403f]/50 outline-none"
                      id="fullName"
                      placeholder="e.g. Jane Doe"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#191c1d]" htmlFor="phone">Phone Number</label>
                    <input
                      className="w-full bg-[#f3f4f5] border-none text-[#191c1d] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#b7102a] focus:bg-white transition-colors placeholder:text-[#5b403f]/50 outline-none"
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="text-xs text-[#5b403f] mt-1">Used for delivery updates and driver contact.</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-[#191c1d]" htmlFor="email">Email Address</label>
                      <span className="material-symbols-outlined text-[16px] text-[#5b403f]/70">lock</span>
                    </div>
                    <div className="relative">
                      <input
                        className="w-full bg-[#edeeef] border-none text-[#5b403f] rounded-lg px-4 py-3 cursor-not-allowed outline-none"
                        id="email"
                        readOnly
                        type="email"
                        value={user?.email}
                      />
                    </div>
                    <p className="text-xs text-[#5b403f] mt-1">Registered account email.</p>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t border-[#e1e3e4] mt-8">
                  <button
                    onClick={() => navigate("/account")}
                    className="px-6 py-3 text-[#191c1d] hover:bg-[#e7e8e9] rounded-lg text-sm font-semibold transition-colors"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-3 bg-[#b7102a] text-white hover:bg-[#db313f] rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 min-w-[120px]"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      "Updating..."
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfileDetails;
