import mongoose, { Schema } from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    flight: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("booking", bookingSchema);
