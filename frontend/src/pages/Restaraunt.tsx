import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAppData } from "../context/AppContext";

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchUser } = useAppData();

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data.restaurant || null);

      if (data.token) {
        localStorage.setItem("token", data.token);
        fetchUser();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  if (loading)
    return <LoadingSpinner fullScreen />;

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return <Navigate to="/seller/dashboard" replace />;
};

export default Restaurant;
