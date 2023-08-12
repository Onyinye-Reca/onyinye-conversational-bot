import express, { Request, Response, NextFunction } from "express";
import {
  createBooking,
  getAllBookings,
  makePayment,
} from "../controllers/bookingController";
const router = express.Router();

router.post("/:flightId", createBooking);
router.get("/", getAllBookings);
router.post("/payment/:bookingId", makePayment);

export default router;
