import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import { Rider } from "../model/Rider.js";

export const addRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Rider Image is required",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to generate image buffer",
      });
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      }
    );

    const {
      name,
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      latitude,
      longitude,
    } = req.body;

    if (
      !name ||
      !phoneNumber ||
      !aadharNumber ||
      !drivingLicenseNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingProfile = await Rider.findOne({
      userId: user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Rider profile already exists",
      });
    }

    const riderProfile = await Rider.create({
      userId: user._id,
      name,
      picture: uploadResult.url,
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      currentAddress: req.body.currentAddress || "Location not updated",
      isAvailble: false,
      isVerified: false,
    });

    return res.status(201).json({
      message: "Rider profile created successfully",
      riderProfile,
    });
  }
);

export const fetchMyProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const account = await Rider.findOne({ userId: user._id });

    res.json(account);
  }
);

export const toggleRiderAvailablity = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const { isAvailble, latitude, longitude, currentAddress } = req.body;

    if (typeof isAvailble !== "boolean") {
      return res.status(400).json({
        message: "isAvailble must be boolean",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "location is required",
      });
    }

    const rider = await Rider.findOne({
      userId: user._id,
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider profile not found",
      });
    }

    if (isAvailble && !rider.isVerified) {
      return res.status(403).json({
        message: "Rider is not verified",
      });
    }

    if (isAvailble) {
      rider.lastOnlineAt = new Date();
    } else if (rider.isAvailble && !isAvailble) {
      // Transitioning from online to offline
      const sessionDuration =
        (new Date().getTime() - new Date(rider.lastOnlineAt).getTime()) / 60000; // in minutes
      rider.totalOnlineTime += Math.round(sessionDuration);
    }

    rider.isAvailble = isAvailble;

    rider.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    if (currentAddress) {
      rider.currentAddress = currentAddress;
    }
    rider.lastActiveAt = new Date();

    await rider.save();

    res.json({
      message: isAvailble ? "Rider is now online" : "Rider is now offline",
      rider,
    });
  }
);

export const acceptOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const riderUserId = req.user?._id;
  const { orderId } = req.params;

  if (!riderUserId) {
    return res.status(400).json({
      message: "Please Login",
    });
  }

  const rider = await Rider.findOne({ userId: riderUserId, isAvailble: true });

  if (!rider) {
    return res.status(404).json({ message: "rider not found" });
  }

  try {
    const { data } = await axios.put(
      `${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`,
      {
        orderId,
        riderId: rider._id.toString(),
        riderUserId: rider.userId,
        riderName: req.user?.name,
        riderImage: rider.picture,
        riderPhone: rider.phoneNumber,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    if (data.success) {
      await Rider.findOneAndUpdate(
        {
          userId: riderUserId,
          isAvailble: true,
        },
        { isAvailble: false },
        { new: true }
      );

      res.json({ message: "Order accepted" });
    }
  } catch (error) {
    res.status(400).json({
      message: "Order already taken",
    });
  }
});

export const fetchMyCurrentOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;

    if (!riderUserId) {
      return res.status(400).json({
        message: "Please Login",
      });
    }

    const rider = await Rider.findOne({
      userId: riderUserId,
      isVerified: true,
    });

    if (!rider) {
      return res.status(404).json({ message: "rider not found" });
    }

    try {
      const { data } = await axios.get(
        `${process.env.RESTAURANT_SERVICE}/api/order/current/rider?riderId=${rider._id}`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        }
      );

      res.json({
        order: data,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.response.data.message,
      });
    }
  }
);

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    const rider = await Rider.findOne({ userId: userId });

    if (!rider) {
      return res.status(404).json({
        message: "Please Login",
      });
    }

    const { orderId } = req.params;

    try {
      const { data } = await axios.put(
        `${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`,
        { orderId },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        }
      );

      res.json({
        message: data.message,
      });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({
        message: error.response.data.message,
      });
    }
  }
);

export const fetchRiderStats = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const rider = await Rider.findOne({ userId: user._id });

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    const { data } = await axios.get(
      `${process.env.RESTAURANT_SERVICE}/api/order/rider/stats?riderId=${rider._id}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );

    res.json({
      ...data,
      totalOnlineTime: rider.totalOnlineTime,
    });
  }
);

export const updateRiderLocation = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { latitude, longitude, currentAddress } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "latitude and longitude are required",
      });
    }

    const rider = await Rider.findOne({
      userId: user._id,
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider profile not found",
      });
    }

    rider.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    if (currentAddress) {
      rider.currentAddress = currentAddress;
    }

    rider.lastActiveAt = new Date();

    await rider.save();

    res.json({
      message: "Rider location updated successfully",
      rider,
    });
  }
);

export const fetchMyOrderHistory = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const rider = await Rider.findOne({ userId: user._id });

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    try {
      const { data } = await axios.get(
        `${process.env.RESTAURANT_SERVICE}/api/order/rider/history?riderId=${rider._id}`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        }
      );

      res.json(data);
    } catch (error: any) {
      res.status(500).json({
        message: error.response?.data?.message || "Internal server error",
      });
    }
  }
);
