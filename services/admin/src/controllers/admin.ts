import { ObjectId } from "mongodb";
import TryCatch from "../middlewares/trycatch.js";
import {
  getRestaurantCollection,
  getRiderCollection,
  getOrderCollection,
  getUserCollection,
} from "../util/collection.js";

export const getPendingRestaurant = TryCatch(async (req, res) => {
  const restaurants = await (await getRestaurantCollection()).aggregate([
    { $match: { isVerified: false } },
    {
      $addFields: {
        ownerObjectId: { $toObjectId: "$ownerId" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "ownerObjectId",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        email: "$owner.email"
      }
    },
    { $project: { owner: 0, ownerObjectId: 0 } }
  ]).toArray();

  res.json({
    count: restaurants.length,
    restaurants,
  });
});

export const getPendingRiders = TryCatch(async (req, res) => {
  const riders = await (await getRiderCollection()).aggregate([
    { $match: { isVerified: false } },
    {
      $addFields: {
        userObjectId: { $toObjectId: "$userId" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "userObjectId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        email: "$user.email"
      }
    },
    { $project: { user: 0, userObjectId: 0 } }
  ]).toArray();

  res.json({
    count: riders.length,
    riders,
  });
});

export const verifyRestaurant = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "invalid restaurant id",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid object id",
    });
  }

  const result = await (
    await getRestaurantCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "Restaurant not found",
    });
  }

  res.json({
    message: "Restaurant verified successfully",
  });
});

export const verifyRider = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "invalid rider id",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid object id",
    });
  }

  const result = await (
    await getRiderCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "rider not found",
    });
  }

  res.json({
    message: "rider verified successfully",
  });
});

export const getAdminStats = TryCatch(async (req, res) => {
  const restaurantCol = await getRestaurantCollection();
  const riderCol = await getRiderCollection();
  const orderCol = await getOrderCollection();
  const userCol = await getUserCollection();

  const totalRestaurants = await restaurantCol.countDocuments();
  const pendingRestaurants = await restaurantCol.countDocuments({ isVerified: false });

  const totalRiders = await riderCol.countDocuments();
  const activeRiders = await riderCol.countDocuments({ isAvailble: true });
  const pendingRiders = await riderCol.countDocuments({ isVerified: false });

  const totalUsers = await userCol.countDocuments({ role: "customer" });

  const activeOrders = await orderCol.countDocuments({
    status: { $ne: "delivered" },
    paymentStatus: "paid"
  });

  const revenueResult = await orderCol.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
  ]).toArray();

  const totalRevenue = revenueResult[0]?.total || 0;
  const totalPaidOrders = revenueResult[0]?.count || 0;

  // Today's Stats
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayResult = await orderCol.aggregate([
    { 
      $match: { 
        paymentStatus: "paid",
        createdAt: { $gte: startOfToday }
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: "$totalAmount" }, 
        count: { $sum: 1 } 
      } 
    }
  ]).toArray();

  const todayRevenue = todayResult[0]?.total || 0;
  const todayOrders = todayResult[0]?.count || 0;

  res.json({
    totalRevenue,
    totalPaidOrders,
    todayRevenue,
    todayOrders,
    activeOrders,
    totalRestaurants,
    pendingRestaurants,
    totalRiders,
    activeRiders,
    pendingRiders,
    totalUsers
  });
});

export const getAllRestaurants = TryCatch(async (req, res) => {
  const restaurants = await (await getRestaurantCollection()).aggregate([
    {
      $addFields: {
        ownerObjectId: { $toObjectId: "$ownerId" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "ownerObjectId",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        email: "$owner.email"
      }
    },
    { $project: { owner: 0, ownerObjectId: 0 } },
    { $sort: { createdAt: -1 } }
  ]).toArray();

  res.json({
    count: restaurants.length,
    restaurants,
  });
});

export const getAllRiders = TryCatch(async (req, res) => {
  const riders = await (await getRiderCollection()).aggregate([
    {
      $addFields: {
        userObjectId: { $toObjectId: "$userId" }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "userObjectId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        email: "$user.email"
      }
    },
    { $project: { user: 0, userObjectId: 0 } },
    { $sort: { createdAt: -1 } }
  ]).toArray();

  res.json({
    count: riders.length,
    riders,
  });
});

export const getAllCustomers = TryCatch(async (req, res) => {
  const customers = await (await getUserCollection()).aggregate([
    { $match: { role: "customer" } },
    {
      $addFields: {
        userIdStr: { $toString: "$_id" }
      }
    },
    {
      $lookup: {
        from: "orders",
        localField: "userIdStr",
        foreignField: "userId",
        as: "orderData"
      }
    },
    {
      $addFields: {
        totalOrders: { $size: "$orderData" },
        totalExpenditure: { 
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$orderData",
                  as: "order",
                  cond: { $eq: ["$$order.paymentStatus", "paid"] }
                }
              },
              as: "o",
              in: "$$o.totalAmount"
            }
          }
        }
      }
    },
    { $project: { orderData: 0, userIdStr: 0, password: 0 } },
    { $sort: { createdAt: -1 } }
  ]).toArray();

  res.json({
    count: customers.length,
    customers,
  });
});
