import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_STEPS = [
  { id: "placed", label: "Order Placed", icon: "order_approve" },
  { id: "accepted", label: "Accepted", icon: "check_circle" },
  { id: "preparing", label: "Preparing", icon: "cooking" },
  { id: "ready_for_rider", label: "Ready", icon: "inventory_2" },
  { id: "rider_assigned", label: "Rider Picked", icon: "delivery_dining" },
  { id: "delivered", label: "Delivered", icon: "task_alt" },
];

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null
  );

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrder(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => fetchOrder();
    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);
    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join", `user:${id}`);
    return () => {
      socket.emit("leave", `user:${id}`);
    };
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;
    const onRiderLocation = ({ latitude, longitude }: any) => {
      setRiderLocation([latitude, longitude]);
    };
    socket.on("rider:location", onRiderLocation);
    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl">error</span>
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Order not found</h2>
        <button
          onClick={() => navigate("/orders")}
          className="text-primary font-bold hover:underline"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex(s =>
    s.id === order.status ||
    (s.id === "rider_assigned" && (order.status === "rider_assigned" || order.status === "picked_up"))
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors text-sm font-bold mb-2 group"
          >
            <span className="material-symbols-outlined mr-1 group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Orders
          </button>
          <h1 className="text-3xl font-black text-on-surface">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="text-on-surface-variant font-medium mt-1">From <span className="text-primary">{order.restaurantName}</span></p>
        </div>
        <div className={`px-6 py-2 rounded-full border-2 font-black uppercase tracking-widest text-sm ${order.status === 'delivered' ? 'border-green-500 text-green-600 bg-green-50' : 'border-primary/20 text-primary bg-primary/5 animate-pulse'
          }`}>
          {order.status.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 shadow-sm">
        <div className="relative flex justify-between">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-surface-container">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'bg-surface-container text-on-surface-variant'
                  } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter mt-3 whitespace-nowrap ${isActive ? 'text-on-surface' : 'text-on-surface-variant'
                  }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {(order.status === "rider_assigned" || order.status === "picked_up") && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-sm h-[400px] relative">
              {riderLocation ? (
                <UserOrderMap
                  riderLocation={riderLocation}
                  deliveryLocation={[
                    order.deliveryAddress.latitude!,
                    order.deliveryAddress.longitude!,
                  ]}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container/30">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-on-surface-variant font-bold animate-pulse">Waiting for rider location...</p>
                </div>
              )}
            </div>
          )}

          {/* Items Section */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">restaurant_menu</span>
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-surface-container-low transition-colors" key={i}>
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">{item.name}</span>
                    <span className="text-xs text-on-surface-variant">Qty: {item.quantity} × ₹{item.price}</span>
                  </div>
                  <span className="font-bold text-on-surface">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-6">Bill Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-medium text-on-surface">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Delivery Fee</span>
                <span className="font-medium text-on-surface">₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Platform Fee</span>
                <span className="font-medium text-on-surface">₹{order.platfromFee}</span>
              </div>
              <div className="h-[1px] bg-outline-variant my-2"></div>
              <div className="flex justify-between text-lg font-black text-on-surface">
                <span>Total</span>
                <span className="text-primary">₹{order.totalAmount}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">payments</span>
                <span>Paid via {order.paymentMethod.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 shadow-sm">
            <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Delivery to
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-on-surface font-bold leading-relaxed">
                  {order.deliveryAddress.fromattedAddress}
                </p>
                <p className="text-sm text-on-surface-variant mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                  {order.deliveryAddress.mobile}
                </p>
              </div>
              {order.riderName && (
                <div className="pt-4 border-t border-outline-variant">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Your Rider</span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden">
                      {order.riderImage ? (
                        <img
                          src={order.riderImage}
                          alt="Rider"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined">delivery_dining</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        {order.riderName || "Assigning Rider..."}
                      </p>
                      <p className="text-xs text-on-surface-variant">{order.riderPhone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
