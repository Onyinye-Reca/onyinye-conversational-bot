import mongoose, { Schema } from "mongoose";

// Define the Flight schema
const flightSchema = new mongoose.Schema({
  departureCity: {
    type: String,
    required: true,
    set: (value: string) => value.toLowerCase(),
  },
  destinationCity: {
    type: String,
    required: true,
    set: (value: string) => value.toLowerCase(),
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

// Define the Airline schema
const airlineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: (value: string) => value.toLowerCase(),
  },
  flights: {
    type: [flightSchema],
    required: true,
  },
});

// Create Airline model using the Airline schema
export const Airline = mongoose.model("Airline", airlineSchema);
