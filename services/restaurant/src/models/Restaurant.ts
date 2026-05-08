import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  description?: string;
  image: string;
  ownerId: string;
  phone: string;
  isVerified: boolean;
  deliveryTime: string;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude]
    formattedAddress: string;
  };
  isOpen: boolean;
  createdAt: Date;
}

const schema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    image: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deliveryTime: {
      type: String,
      default: "20-30 min",
    },

    autoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formattedAddress: {
        type: String,
      },
    },

    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ autoLocation: "2dsphere" });

export default mongoose.model<IRestaurant>("Restaurant", schema, "restaurants");
