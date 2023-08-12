import { Airline } from "../models/airlineModel";
import {
  createAirline,
  createFlight,
  getAllAirlines,
  getAirlinesByUserInput,
} from "../controllers/airlineController";

import { Request, Response } from "express";

describe("createAirline Controller", () => {
  it("should create a new airline", async () => {
    // Mock request and response objects
    const req = {
      body: {
        name: "Test Airline",
        flights: [],
      },
    } as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.findOne to return null (no existing airline)
    Airline.findOne = jest.fn().mockResolvedValue(null);

    // Mock Airline constructor and save method
    const saveMock = jest.fn();
    jest.spyOn(Airline.prototype, "save").mockImplementation(saveMock);

    // Call the controller function
    await createAirline(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(saveMock).toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledWith({
      message: "airline successfully created",
      data: expect.any(Object),
    });
  });
});

describe("createFlight Controller", () => {
  it("should add a flight to an existing airline", async () => {
    // Mock request and response objects
    const req = {
      params: { id: "mockAirlineId" },
      body: {
        departureCity: "City A",
        destinationCity: "City B",
        price: 200,
        date: "2023-09-15",
      },
    } as unknown as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.findById to return an existing airline
    const existingAirline = {
      _id: "mockAirlineId",
      flights: [],
      save: jest.fn(),
    };
    Airline.findById = jest.fn().mockResolvedValue(existingAirline);

    // Call the controller function
    await createFlight(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(existingAirline.flights).toHaveLength(1); // Assuming you pushed the flight data to the array
    expect(sendMock).toHaveBeenCalledWith({
      message: "Flight successfully added",
      existingAirline: existingAirline,
    });
    expect(existingAirline.save).toHaveBeenCalled();
  });

  it('should return "airline not found" if airline does not exist', async () => {
    // Mock request and response objects
    const req = {
      params: { id: "nonExistentAirlineId" },
      body: {
        departureCity: "City A",
        destinationCity: "City B",
        price: 200,
        date: "2023-09-15",
      },
    } as unknown as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.findById to return null (no existing airline)
    Airline.findById = jest.fn().mockResolvedValue(null);

    // Call the controller function
    await createFlight(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith("airline not found");
  });

  it("should handle errors", async () => {
    // Mock request and response objects
    const req = {
      params: { id: "mockAirlineId" },
      body: {
        departureCity: "City A",
        destinationCity: "City B",
        price: 200,
        date: "2023-09-15",
      },
    } as unknown as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.findById to throw an error
    Airline.findById = jest.fn().mockRejectedValue(new Error("Mocked Error"));

    // Call the controller function
    await createFlight(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      message: "Error adding flight",
      error: expect.any(Object),
    });
  });
});

describe("getAllAirlines Controller", () => {
  it("should retrieve a list of all airlines", async () => {
    // Mock request and response objects
    const req = {} as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.find and Airline.countDocuments to return sample data
    const sampleAirlines = [
      { name: "Airline 1", flights: [] },
      { name: "Airline 2", flights: [] },
    ];
    Airline.find = jest.fn().mockResolvedValue(sampleAirlines);
    Airline.countDocuments = jest.fn().mockResolvedValue(sampleAirlines.length);

    // Call the controller function
    await getAllAirlines(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      count: sampleAirlines.length,
      airlines: sampleAirlines,
    });
  });

  it("should handle errors", async () => {
    // Mock request and response objects
    const req = {} as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.find and Airline.countDocuments to throw an error
    Airline.find = jest.fn().mockRejectedValue(new Error("Mocked Error"));
    Airline.countDocuments = jest
      .fn()
      .mockRejectedValue(new Error("Mocked Error"));

    // Call the controller function
    await getAllAirlines(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      message: "Error fetching airlines",
      error: expect.any(Object),
    });
  });
});

describe("getAirlinesByUserInput Controller", () => {
  it("should retrieve available airlines based on user input", async () => {
    // Mock request and response objects
    const req = {
      query: {
        departureCity: "City A",
        destinationCity: "City B",
        date: "2023-09-15",
      },
    } as unknown as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.aggregate to return sample data
    const sampleAirlines = [
      {
        name: "Airline 1",
        flights: [
          {
            departureCity: "City A",
            destinationCity: "City B",
            date: "2023-09-15",
            price: 200,
          },
        ],
      },
      { name: "Airline 2", flights: [] },
    ];
    Airline.aggregate = jest.fn().mockResolvedValue(sampleAirlines);

    // Call the controller function
    await getAirlinesByUserInput(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      message: "Available airlines",
      airlines: sampleAirlines,
    });
  });

  it("should handle no available airlines", async () => {
    // Mock request and response objects
    const req = {
      query: {
        departureCity: "City X",
        destinationCity: "City Z",
        date: "2023-09-15",
      },
    } as unknown as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.aggregate to return an empty array
    Airline.aggregate = jest.fn().mockResolvedValue([]);

    // Call the controller function
    await getAirlinesByUserInput(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({ message: "No available airline" });
  });

  it("should handle errors", async () => {
    // Mock request and response objects
    const req = {
      query: {
        departureCity: "City A",
        destinationCity: "City B",
        date: "2023-09-15",
      },
    } as unknown as Request;

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ json: sendMock }));
    const res = {
      status: statusMock,
    } as unknown as Response;

    // Mock Airline.aggregate to throw an error
    Airline.aggregate = jest.fn().mockRejectedValue(new Error("Mocked Error"));

    // Call the controller function
    await getAirlinesByUserInput(req, res);

    // Check if the response was as expected
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      message: "Error fetching airlines",
      error: expect.any(Object),
    });
  });
});
