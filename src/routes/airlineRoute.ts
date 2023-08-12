import express, { Request, Response, NextFunction } from "express";
import {
  createAirline,
  createFlight,
  getAirlinesByUserInput,
  getAllAirlines,
} from "../controllers/airlineController";
const router = express.Router();

router.post("/", createAirline);
router.post("/:id/flights", createFlight);
router.get("/", getAllAirlines);
router.get("/search", getAirlinesByUserInput);

export default router;
