import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  acceptOrder,
  addRiderProfile,
  fetchMyCurrentOrder,
  fetchMyOrderHistory,
  fetchMyProfile,
  fetchRiderStats,
  toggleRiderAvailablity,
  updateOrderStatus,
  updateRiderLocation,
} from "../controllers/rider.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, uploadFile, addRiderProfile);

router.get("/myprofile", isAuth, fetchMyProfile);
router.get("/stats", isAuth, fetchRiderStats);
router.patch("/toggle", isAuth, toggleRiderAvailablity);
router.patch("/location", isAuth, updateRiderLocation);
router.post("/accept/:orderId", isAuth, acceptOrder);
router.get("/order/current", isAuth, fetchMyCurrentOrder);
router.get("/order/history", isAuth, fetchMyOrderHistory);
router.put("/order/update/:orderId", isAuth, updateOrderStatus);

export default router;
