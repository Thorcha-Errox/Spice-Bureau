import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  getPendingRestaurant,
  getPendingRiders,
  verifyRestaurant,
  verifyRider,
  getAdminStats,
  getAllRestaurants,
  getAllRiders,
  getAllCustomers,
} from "../controllers/admin.js";

const router = express.Router();

router.get("/admin/restaurant/pending", isAuth, isAdmin, getPendingRestaurant);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);
router.get("/admin/restaurant/all", isAuth, isAdmin, getAllRestaurants);
router.get("/admin/rider/all", isAuth, isAdmin, getAllRiders);
router.get("/admin/customer/all", isAuth, isAdmin, getAllCustomers);

router.get("/admin/stats", isAuth, isAdmin, getAdminStats);

router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
router.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);


export default router;
