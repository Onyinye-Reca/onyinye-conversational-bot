import express, { Request, Response, NextFunction } from "express";
import { Airline } from "../models/airlineModel"; // Assuming you've exported the interfaces from the model file

export const createAirline = async (req: Request, res: Response) => {
  try {
    const existingAirline = await Airline.findOne({ name: req.body.name });
    if (existingAirline) {
      return res.send("Airline already existing");
    }

    const { name, flights } = req.body;

    const newAirline = new Airline({ name, flights });
    await newAirline.save();

    res.status(201).send({
      message: "airline successfully created",
      data: newAirline,
    });
  } catch (error) {
    res.status(500).send({ message: "Error creating airline", error });
  }
};

export const createFlight = async (req: Request, res: Response) => {
  try {
    const airlineId = req.params.id;
    const { departureCity, destinationCity, price, date } = req.body;

    const existingAirline = await Airline.findById(airlineId);

    if (!existingAirline) {
      res.status(404).send("airline not found");
    }

    existingAirline?.flights.push({
      departureCity,
      destinationCity,
      price,
      date,
    });

    await existingAirline?.save();

    res
      .status(201)
      .send({ message: "Flight successfully added", existingAirline });
  } catch (error) {
    res.status(500).send({ message: "Error adding flight", error });
  }
};

export const getAllAirlines = async (req: Request, res: Response) => {
  try {
    const airlines = await Airline.find({});
    const count = await Airline.countDocuments();
    res.status(200).send({ count, airlines });
  } catch (error) {
    res.status(500).json({ message: "Error fetching airlines", error });
  }
};

export const getAirlinesByUserInput = async (req: Request, res: Response) => {
  try {
    const destinationCity: string = req.query.destinationCity as string;
    const departureCity: string = req.query.departureCity as string;
    const date: string = req.query.date as string;
    const query = {
      "flights.departureCity": departureCity.toLowerCase(),
      "flights.destinationCity": destinationCity.toLowerCase(),
      "flights.date": new Date(date),
    };

    const airlines = await Airline.aggregate([
      {
        $match: query,
      },
      {
        $project: {
          name: 1,
          flights: {
            $filter: {
              input: "$flights",
              as: "flight",
              cond: {
                $and: [
                  {
                    $eq: [
                      "$$flight.departureCity",
                      departureCity.toLowerCase(),
                    ],
                  },
                  {
                    $eq: [
                      "$$flight.destinationCity",
                      destinationCity.toLowerCase(),
                    ],
                  },
                  { $eq: ["$$flight.date", new Date(date)] },
                ],
              },
            },
          },
        },
      },
    ]);
    if (airlines.length > 0) {
      res.status(200).send({ message: "Available airlines", airlines });
    } else {
      res.status(404).send({ message: "No available airline" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching airlines", error });
  }
};
