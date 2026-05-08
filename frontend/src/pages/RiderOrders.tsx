import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const ACTIVE_STATUSES = [
  "rider_assigned",
  "picked_up",
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "ready_for_rider":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "preparing":
    case "accepted":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "placed":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "rider_assigned":
    case "picked_up":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const RiderOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl">local_shipping</span>
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">No deliveries yet</h2>
        <p className="text-on-surface-variant max-w-xs mb-8">
          Once you accept and complete delivery requests, they will appear here.
        </p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status)
  );

  return (
    <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen no-scrollbar">
      {activeOrders.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-on-surface flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
            Current Deliveries
          </h2>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => navigate("/rider/dashboard")}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-6 text-on-surface">
          {activeOrders.length > 0 ? "Past Deliveries" : " Delivery Log"}
        </h2>
        {completedOrders.length === 0 ? (
          <p className="text-on-surface-variant italic">No completed deliveries yet.</p>
        ) : (
          <div className="space-y-4">
            {completedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => { }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

const OrderCard = ({ order, onClick }: { order: IOrder; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
            Order #{order._id.slice(-6).toUpperCase()}
          </h3>
          <p className="text-sm text-on-surface-variant mt-1 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">restaurant</span>
            {order.restaurantName}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-black rounded-full border transition-transform group-hover:scale-105 ${getStatusStyles(
            order.status
          )}`}
        >
          {order.status.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-sm">distance</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-on-surface-variant font-bold uppercase">Distance</span>
            <span className="text-xs font-black">{order.distance} km</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-sm">schedule</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-on-surface-variant font-bold uppercase">Date & Time</span>
            <span className="text-xs font-black">
              {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-sm">payments</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-on-surface-variant font-bold uppercase">Earnings</span>
            <span className="text-xs font-black text-green-600">₹{order.riderAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderOrders;
