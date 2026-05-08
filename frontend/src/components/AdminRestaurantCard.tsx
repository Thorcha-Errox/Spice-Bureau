import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { FiCheckCircle } from "react-icons/fi";

const AdminRestaurantCard = ({
  restaurant,
  onVerify,
}: {
  restaurant: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Restaurant verified");
      onVerify();
    } catch (error) {
      toast.error("failed ot verify restaurant");
    }
  };
  return (
    <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="relative h-44 w-full mb-4 overflow-hidden rounded-2xl">
        <img
          src={restaurant.image}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={restaurant.name}
        />
        <div className={`absolute top-3 left-3 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-sm ${
          restaurant.isVerified ? "bg-green-100/90 text-green-700" : "bg-orange-100/90 text-orange-700"
        }`}>
          {restaurant.isVerified ? "Verified Partner" : "Pending Approval"}
        </div>
      </div>
      
      <div className="space-y-1 mb-4">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{restaurant.name}</h3>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-[18px]">mail</span>
          <span className="text-sm font-medium">{restaurant.email || "No email available"}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-[18px]">phone</span>
          <span className="text-sm font-medium">{restaurant.phone}</span>
        </div>
        <div className="flex items-start gap-2 text-slate-400">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0">location_on</span>
          <p className="text-xs font-medium leading-relaxed line-clamp-2">{restaurant.autoLocation?.formattedAddress}</p>
        </div>
      </div>


      {!restaurant.isVerified ? (
        <button
          className="w-full rounded-2xl bg-secondary py-3 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-secondary/20"
          onClick={verify}
        >
          Verify Restaurant
        </button>
      ) : (
        <div className="w-full rounded-2xl bg-slate-50 py-3 text-slate-400 font-bold text-sm text-center border border-slate-100 flex items-center justify-center gap-2">
          <FiCheckCircle className="text-secondary" />
          Partner Verified
        </div>
      )}
    </div>


  );
};

export default AdminRestaurantCard;
