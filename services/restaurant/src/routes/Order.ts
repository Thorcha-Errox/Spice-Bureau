import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  assignRiderToOrder,
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  fetchRiderOrders,
  fetchSingleOrder,
  getCurrentOrderForRider,
  getMyOrders,
  getRiderStats,
  updateOrderStatus,
  updateOrderStatusRider,
} from "../controllers/order.js";

const router = express.Router();

router.get("/myorder", isAuth, getMyOrders);
router.get("/rider/stats", getRiderStats);
router.get("/:id", isAuth, fetchSingleOrder);
router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get("/restaurant/:restaurantId", isAuth, isSeller, fetchRestaurantOrders);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);
router.put("/assign/rider", assignRiderToOrder);
router.get("/current/rider", getCurrentOrderForRider);
router.get("/rider/history", fetchRiderOrders);
router.put("/update/status/rider", updateOrderStatusRider);

export default router;
