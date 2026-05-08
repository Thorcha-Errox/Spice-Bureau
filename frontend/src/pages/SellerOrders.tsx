import { useEffect, useState } from "react";
import type { IOrder, IRestaurant } from "../types";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
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

const SellerOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const { socket } = useSocket();

  const fetchRestaurantAndOrders = async () => {
    try {
      const { data: resData } = await axios.get(`${restaurantService}/api/restaurant/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!resData.restaurant) {
        toast.error("Restaurant not found");
        setLoading(false);
        return;
      }

      setRestaurant(resData.restaurant);
      const restaurantId = resData.restaurant._id;
      const { data: orderData } = await axios.get(
        `${restaurantService}/api/order/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders(orderData.orders || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantAndOrders();
  }, []);

  useEffect(() => {
    if (!socket || !restaurant) return;

    const onOrderUpdate = () => {
      fetchRestaurantAndOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket, restaurant]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl">receipt_long</span>
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">No orders yet</h2>
        <p className="text-on-surface-variant max-w-xs mb-8">
          When customers place orders at your restaurant, they will appear here.
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
            Active Orders
          </h2>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => { }}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-6 text-on-surface">
          {activeOrders.length > 0 ? "Completed Orders" : "Order History"}
        </h2>
        {completedOrders.length === 0 ? (
          <p className="text-on-surface-variant italic">No completed orders yet.</p>
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
  const itemSummary = order.items
    .map((item) => `${item.name} x ${item.quantity}`)
    .join(", ");

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
          <div className="flex items-center gap-4 mt-1">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-[10px] font-black rounded-full border transition-transform group-hover:scale-105 ${getStatusStyles(
            order.status
          )}`}
        >
          {order.status.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-on-surface-variant text-sm line-clamp-2 italic">
          {itemSummary}
        </p>
      </div>

      {order.note && (
        <div className="mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-lg">notes</span>
          <p className="text-xs text-on-surface-variant italic">"{order.note}"</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
        <div className="flex flex-col">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Order Value</span>
          <span className="font-bold text-xl text-on-surface">₹{order.totalAmount}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Payment Status</span>
          <span className="text-sm font-bold text-secondary uppercase tracking-tighter">{order.paymentStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
