import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-primary/10 text-primary border-primary/20";
    case "accepted":
      return "bg-secondary/10 text-secondary border-secondary/20";
    case "preparing":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "ready_for_rider":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "picked_up":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "delivered":
      return "bg-secondary/10 text-secondary border-secondary/20";
    default:
      return "bg-surface-variant/30 text-on-surface-variant border-surface-variant/50";
  }
};

const OrderCard = ({ order, onStatusUpdate }: props) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);
  const [countdown, setCountdown] = useState(20);

  const actions = ORDER_ACTIONS[order.status] || [];

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      setCountdown(20);
      return;
    }

    if (retryVisible) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRetryVisible(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order.status, retryVisible]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      if (status === "ready_for_rider") {
        setRetryVisible(false);
        setCountdown(20);
      }
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order updated");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-surface-variant/50 p-6 md:p-8 space-y-6 group hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Order ID</span>
          </div>
          <h3 className="font-display-lg text-lg text-on-surface font-black italic tracking-tight">#{order._id.slice(-6).toUpperCase()}</h3>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${statusColor(order.status)}`}>
            {order.status === 'ready_for_rider' && (
              <span className="flex items-center gap-1 text-blue-600 font-black">
                <span className="material-symbols-outlined text-[12px] filled">moped</span>
                {!retryVisible && <span className="text-[10px] ml-1">{countdown}s</span>}
              </span>
            )}
            {order.status === 'placed' && <span className="material-symbols-outlined text-[12px] filled">notifications_active</span>}
            {order.status === 'preparing' && <span className="material-symbols-outlined text-[12px] filled">cooking</span>}
            <span className="ml-1">{order.status.replaceAll("_", " ")}</span>
          </span>
          <div className="flex items-center gap-1.5 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            <p className="font-bold text-[10px] uppercase tracking-widest">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface/50 rounded-2xl p-4 space-y-3 border border-surface-variant/30">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center group/item">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-surface-variant/50 flex items-center justify-center font-display-lg text-[12px] text-primary font-black shadow-sm group-hover/item:scale-110 transition-transform duration-300">
                {item.quantity}x
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-on-surface group-hover/item:text-primary transition-colors">{item.name}</span>
                <span className="text-[9px] text-on-surface-variant/60 font-medium">Standard Preparation</span>
              </div>
            </div>
            <div className="w-1 h-1 rounded-full bg-surface-variant/50 group-hover/item:bg-primary/30 transition-colors"></div>
          </div>
        ))}
      </div>

      {order.note && (
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-xl">notes</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Customer Note</p>
            <p className="text-sm text-on-surface-variant italic font-medium leading-relaxed">"{order.note}"</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-1">
        <div className="space-y-0.5">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50">Amount to Collect</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display-lg text-2xl text-on-surface font-black italic tracking-tighter">₹{order.totalAmount}</span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 block">Payment</span>
          <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${order.paymentStatus === 'paid' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {order.paymentStatus === "paid" && actions.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {actions.map((status) => (
              <button
                key={status}
                disabled={loading}
                onClick={() => updateStatus(status)}
                className="group relative overflow-hidden bg-primary text-white p-3 rounded-xl font-display-lg text-[11px] font-black italic tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Mark as {status.replaceAll("_", " ")}</span>
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </button>
            ))}
          </div>
        )}

        {order.status === "ready_for_rider" && retryVisible && (
          <button
            className="w-full rounded-2xl border-2 border-primary/20 py-3 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 hover:border-primary/40 transition-all duration-300"
            onClick={() => updateStatus("ready_for_rider")}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span>Retry Ready for Rider</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
