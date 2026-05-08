import axios from "axios";
import toast from "react-hot-toast";
import { FiCheckCircle } from "react-icons/fi";
import { adminService } from "../main";

const RiderAdmin = ({
  rider,
  onVerify,
}: {
  rider: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Rider verified successfully");
      onVerify();
    } catch (error) {
      toast.error("Failed to verify rider");
    }
  };
  return (
    <div className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="relative h-44 w-full mb-4 overflow-hidden rounded-2xl">
        <img
          src={rider.picture}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={rider.phoneNumber}
        />
        <div className={`absolute top-3 left-3 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-sm ${
          rider.isVerified ? "bg-green-100/90 text-green-700" : "bg-orange-100/90 text-orange-700"
        }`}>
          {rider.isVerified ? "Verified Rider" : "Pending Rider"}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="material-symbols-outlined text-[20px]">phone</span>
            <span className="text-lg font-bold tracking-tight">{rider.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span className="text-sm font-medium">{rider.email || "No email available"}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Aadhar No.</p>
            <p className="text-xs font-bold text-slate-700">{rider.aadharNumber}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">DL Number</p>
            <p className="text-xs font-bold text-slate-700">{rider.drivingLicenseNumber}</p>
          </div>
        </div>
      </div>

      {!rider.isVerified ? (
        <button
          className="w-full rounded-2xl bg-secondary py-3 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-secondary/20"
          onClick={verify}
        >
          Verify Rider
        </button>
      ) : (
        <div className="w-full rounded-2xl bg-slate-50 py-3 text-slate-400 font-bold text-sm text-center border border-slate-100 flex items-center justify-center gap-2">
          <FiCheckCircle className="text-secondary" />
          Rider Verified
        </div>
      )}
    </div>



  );
};

export default RiderAdmin;
