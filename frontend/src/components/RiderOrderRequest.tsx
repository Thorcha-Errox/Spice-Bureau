import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order Accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response.data.message);
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-primary/20 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/40 animate-in fade-in zoom-in">

      
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <span className="bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold tracking-wider mb-1 inline-block uppercase">
            Order #{orderId.slice(-6)}
          </span>
          <h4 className="font-label-md text-label-md text-primary font-bold">New Delivery Request</h4>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label-sm text-[10px] font-bold text-error flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] animate-pulse">timer</span>
            {secondsLeft}s
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 p-3 bg-surface-container-low rounded-lg">
        <span className="material-symbols-outlined text-primary">delivery_dining</span>
        <p className="text-xs text-on-surface-variant">Stay alert! A new order is ready for pickup near you.</p>
      </div>

      <button
        disabled={accepting}
        onClick={acceptOrder}
        className="w-full bg-[#b7102a] text-on-primary hover:bg-[#92001c] py-2.5 rounded-lg font-label-md text-label-md transition-all duration-200 shadow-sm shadow-primary/20 disabled:opacity-50"
      >
        {accepting ? "Accepting..." : "Accept Order"}
      </button>
    </div>
  );
};

export default RiderOrderRequest;
