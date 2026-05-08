import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, restaurantService } from "../main";
import type { AppContextType, ICart, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    const [location, setLocation] = useState<LocationData | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false)
    const [city, setCity] = useState("Fetching Location...");

    async function fetchUser() {
        try {
            const token = localStorage.getItem("token")

            const { data } = await axios.get(`${authService}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(data);
            setIsAuth(true);

            if (data.role === "seller") {
                const res = await axios.get(`${restaurantService}/api/restaurant/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsVerified(res.data.restaurant?.isVerified || false);
            } else if (data.role === "rider") {
                const res = await axios.get(`${restaurantService.replace("restaurant", "rider")}/api/rider/myprofile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsVerified(res.data?.isVerified || false);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const [cart, setCart] = useState<ICart[]>([]);
    const [subTotal, setSubTotal] = useState(0);
    const [quantity, setQuantity] = useState(0);

    async function fetchCart() {
        if (!user || user.role !== "customer") return;
        try {
            const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setCart(data.cart || []);
            setSubTotal(data.subtotal || 0);
            setQuantity(data.cartLength);
        } catch (error) {
            console.log(error);
        }
    }


    const fetchCurrentLocation = () => {
        if (!navigator.geolocation)
            return alert("Please Allow Location to continue");

        setLoadingLocation(true);
        setCity("Fetching Location...");

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const data = await res.json();

                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: data.display_name || "current location",
                });

                setCity(
                    data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    "Your Location"
                );
                setLoadingLocation(false);
            } catch (error) {
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress: "Current Location",
                });
                setCity("Failed to load");
                setLoadingLocation(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            setCity("Location Denied");
            setLoadingLocation(false);
        });
    };

    useEffect(() => {
        fetchUser();
        fetchCurrentLocation();
    }, []);

    useEffect(() => {
        if (user && user.role === "customer") {
            fetchCart();
        }
    }, [user]);

    return (
        <AppContext.Provider
            value={{
                isAuth,
                isVerified,
                loading,
                setIsAuth,
                setIsVerified,
                setLoading,
                setUser,
                user,
                location,
                setLocation,
                loadingLocation,
                city,
                setCity,
                fetchCurrentLocation,
                cart,
                fetchCart,
                fetchUser,
                quantity,
                subTotal,
            }}
        >
            {children}

            <Toaster />
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useAppData must be used within AppProvider")
    }
    return context;
};