import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const updateStatus = async () => {
    try {
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order status");
    }
  };
  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-outline-variant/10 relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-primary/20 animate-in fade-in slide-in-from-bottom-4 group">

      <h4 className="font-display-lg text-lg text-on-surface font-black italic tracking-tight mb-4">{order.restaurantName}</h4>
      <div className="relative pl-9 mb-4">
        <div className="absolute left-[17px] top-3 bottom-3 w-[2px] bg-dashed-gradient bg-[length:1px_12px] bg-repeat-y bg-outline-variant/30"></div>
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute -left-[27px] top-1.5 w-4 h-4 bg-white border-2 border-outline-variant/30 rounded-full flex items-center justify-center z-10">
              <div className="w-1.5 h-1.5 bg-outline-variant/30 rounded-full"></div>
            </div>
            <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-black mb-0.5">Pickup From</p>
            <p className="font-bold text-on-surface leading-tight text-xs">{order.restaurantName}</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[27px] top-1.5 w-4 h-4 bg-white border-2 border-primary rounded-full flex items-center justify-center z-10 shadow-sm shadow-primary/10">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            </div>
            <p className="text-[9px] text-primary uppercase tracking-[0.2em] font-black mb-0.5">Deliver To</p>
            <p className="font-bold text-on-surface leading-snug line-clamp-2 text-xs">{order.deliveryAddress.fromattedAddress}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface-container-low/40 p-3 rounded-[1.2rem] border border-outline-variant/5">
          <p className="text-[8px] text-on-surface-variant/50 uppercase tracking-widest font-black mb-1">Your Earnings</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display-lg text-lg text-primary font-black italic tracking-tighter">₹{order.riderAmount}</span>
          </div>
        </div>
        <div className="bg-surface-container-low/40 p-3 rounded-[1.2rem] border border-outline-variant/5">
          <p className="text-[8px] text-on-surface-variant/50 uppercase tracking-widest font-black mb-1">Total Value</p>
          <p className="font-display-lg text-lg text-on-surface font-black italic tracking-tighter">₹{order.totalAmount}</p>
        </div>
      </div>

      {order.deliveryAddress.mobile && (
        <div className="flex items-center justify-between bg-surface-container-low/20 border border-outline-variant/5 rounded-[1.2rem] p-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-outline-variant/5 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-lg filled">contact_phone</span>
            </div>
            <div>
              <p className="text-[8px] text-on-surface-variant/40 uppercase tracking-widest font-black mb-0.5">Customer</p>
              <p className="font-display-lg text-sm text-on-surface font-black italic tracking-tighter">{order.deliveryAddress.mobile}</p>
            </div>
          </div>
          <a
            href={`tel:${order.deliveryAddress.mobile}`}
            className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="material-symbols-outlined text-lg">call</span>
          </a>
        </div>
      )}

      <div className="space-y-2">
        {order.status === "rider_assigned" && (
          <button
            onClick={() => updateStatus()}
            className="w-full bg-primary text-white hover:opacity-95 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group/btn"
          >
            <span className="material-symbols-outlined text-lg filled group-hover/btn:rotate-12 transition-transform">restaurant</span>
            Reached Restaurant
          </button>
        )}

        {order.status === "picked_up" && (
          <button
            onClick={() => updateStatus()}
            className="w-full bg-secondary text-white hover:opacity-95 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-secondary/10 flex items-center justify-center gap-2 group/btn"
          >
            <span className="material-symbols-outlined text-lg filled group-hover/btn:scale-110 transition-transform">check_circle</span>
            Complete Delivery
          </button>
        )}
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
