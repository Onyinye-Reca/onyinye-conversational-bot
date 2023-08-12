import express, { Request, Response, NextFunction } from "express";
import { Airline } from "../models/airlineModel";
import { Booking } from "../models/bookingModel";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName } = req.body;

    const flightId = req.params.flightId;

    const matchingAirline = await Airline.findOne({
      "flights._id": flightId,
    });

    if (!matchingAirline) {
      return res.status(404).send({ message: "Flight not found" });
    }

    // Filter the matching flight based on flightId
    const matchingFlight = matchingAirline.flights.find(
      (flight) => flight?._id?.toString() === flightId
    );

    if (!matchingFlight) {
      return res.status(404).send({ message: "Matching flight not found" });
    }

    const booking = new Booking({
      firstName,
      lastName,
      flight: matchingFlight?._id,
    });

    await booking.save();

    res.status(201).send({ message: "Flight booked successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error querying airline", error });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({});
    res
      .status(200)
      .send({ message: "Bookings fetched successfully", bookings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

export const makePayment = async (req: Request, res: Response) => {
  try {
    const flightId = req.params.flightId;

    const booking = await Booking.findOne({ flight: flightId });

    if (!booking) {
      return res.status(404).send({ message: "Flight booking not found" });
    }

    if (booking?.isBooked) {
      return res
        .status(404)
        .send({ message: "This flight has already been booked and payed for" });
    }

    // Simulate payment by updating the flight's isBooked status
    booking.isBooked = true;
    await booking.save();

    res.status(200).json({ message: "Payment confirmed and flight booked" });
  } catch (error) {
    res.status(500).json({ message: "Error processing payment", error });
  }
};
