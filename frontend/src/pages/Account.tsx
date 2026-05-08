import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] font-['Be_Vietnam_Pro'] antialiased min-h-screen flex flex-col pt-safe pb-safe selection:bg-[#db313f] selection:text-white">
      <main className="flex-grow pt-8 pb-32 px-5 overflow-y-auto w-full max-w-2xl mx-auto flex flex-col gap-6">
        <section className="flex flex-col items-center justify-center py-6 gap-4 mt-2">
          <div className="relative w-24 h-24 rounded-full shadow-[0_8px_20px_rgb(183,16,42,0.15)] overflow-hidden bg-[#edeeef]">
            <img
              alt="Profile Picture"
              className="w-full h-full object-cover"
              src={user?.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            />
          </div>
          <div className="text-center flex flex-col gap-1">
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#191c1d]">{user?.name}</h2>
            <p className="text-base text-[#5b403f]">{user?.email}</p>
          </div>
          <button
            onClick={() => navigate("/profile-details")}
            className="mt-2 bg-[#b7102a]/10 text-[#b7102a] font-semibold text-sm px-6 py-2 rounded-full active:scale-95 transition-transform"
          >
            Edit Profile
          </button>
        </section>

        <section className="flex flex-col gap-1">
          <div
            onClick={() => navigate("/profile-details")}
            className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-xl hover:bg-[#edeeef] transition-colors cursor-pointer active:scale-[0.98] group"
          >
            <div className="w-10 h-10 rounded-full bg-[#edeeef] flex items-center justify-center text-[#b7102a] group-hover:bg-[#b7102a]/10 transition-colors">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg text-[#191c1d]">Profile Details</h3>
              <p className="text-sm text-[#5b403f]">Personal info, phone number</p>
            </div>
            <span className="material-symbols-outlined text-[#e4bebc] group-hover:text-[#b7102a] transition-colors">chevron_right</span>
          </div>

          <div
            onClick={() => navigate("/address")}
            className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-xl hover:bg-[#edeeef] transition-colors cursor-pointer active:scale-[0.98] group"
          >
            <div className="w-10 h-10 rounded-full bg-[#edeeef] flex items-center justify-center text-[#b7102a] group-hover:bg-[#b7102a]/10 transition-colors">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg text-[#191c1d]">Saved Addresses</h3>
              <p className="text-sm text-[#5b403f]">Home, work, and others</p>
            </div>
            <span className="material-symbols-outlined text-[#e4bebc] group-hover:text-[#b7102a] transition-colors">chevron_right</span>
          </div>

          <div
            onClick={() => navigate("/orders")}
            className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-xl hover:bg-[#edeeef] transition-colors cursor-pointer active:scale-[0.98] group"
          >
            <div className="w-10 h-10 rounded-full bg-[#edeeef] flex items-center justify-center text-[#b7102a] group-hover:bg-[#b7102a]/10 transition-colors">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg text-[#191c1d]">Order History</h3>
              <p className="text-sm text-[#5b403f]">Past orders, reorder favorites</p>
            </div>
            <span className="material-symbols-outlined text-[#e4bebc] group-hover:text-[#b7102a] transition-colors">chevron_right</span>
          </div>
        </section>

        <section className="mt-6 mb-12">
          <button
            onClick={logoutHandler}
            className="w-full flex items-center justify-center gap-2 p-4 bg-[#ffdad6] text-[#93000a] rounded-xl hover:bg-[#fbd3d0] transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-semibold text-sm">Log Out</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Account;
