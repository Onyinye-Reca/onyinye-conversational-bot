import { Request, Response } from "express";
import {
  createBooking,
  getAllBookings,
  makePayment,
} from "../controllers/bookingController";
import { Airline } from "../models/airlineModel";
import { Booking } from "../models/bookingModel";

describe("Booking Controllers", () => {
  describe("createBooking", () => {
    it("should create a booking for a valid flight", async () => {
      // Mock request and response objects
      const req = {
        body: {
          firstName: "John",
          lastName: "Doe",
        },
        params: {
          flightId: "validFlightId",
        },
      } as unknown as Request;

      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ send: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Airline.findOne and Booking.prototype.save
      const matchingFlight = {
        _id: "validFlightId",
      };
      Airline.findOne = jest.fn().mockResolvedValue({
        flights: [matchingFlight],
      });
      Booking.prototype.save = jest.fn().mockResolvedValue(undefined);

      // Call the controller function
      await createBooking(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith({
        message: "Flight booked successfully",
        booking: expect.any(Object),
      });
    });

    it("should return 404 if flight not found", async () => {
      // Mock request and response objects
      const req = {
        body: {
          firstName: "John",
          lastName: "Doe",
        },
        params: {
          flightId: "nonExistentFlightId",
        },
      } as unknown as Request;

      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ send: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Airline.findOne to return null
      Airline.findOne = jest.fn().mockResolvedValue(null);

      // Call the controller function
      await createBooking(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith({ message: "Flight not found" });
    });

    it("should return 404 if matching flight not found", async () => {
      // Mock request and response objects
      const req = {
        body: {
          firstName: "John",
          lastName: "Doe",
        },
        params: {
          flightId: "invalidFlightId",
        },
      } as unknown as Request;

      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ send: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Airline.findOne to return valid airline
      Airline.findOne = jest.fn().mockResolvedValue({
        flights: [],
      });

      // Call the controller function
      await createBooking(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith({
        message: "Matching flight not found",
      });
    });

    it("should handle errors", async () => {
      // Mock request and response objects
      const req = {
        body: {
          firstName: "John",
          lastName: "Doe",
        },
        params: {
          flightId: "validFlightId",
        },
      } as unknown as Request;

      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Airline.findOne to throw an error
      Airline.findOne = jest.fn().mockRejectedValue(new Error("Mocked Error"));

      // Call the controller function
      await createBooking(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith({
        message: "Error querying airline",
        error: expect.any(Object),
      });
    });
  });

  describe("getAllBookings", () => {
    it("should retrieve all bookings", async () => {
      // Mock request and response objects
      const req = {} as Request;
      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ send: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Booking.find
      const sampleBookings = [
        { firstName: "John", lastName: "Doe", flight: "flightId1" },
        { firstName: "Jane", lastName: "Smith", flight: "flightId2" },
      ];
      Booking.find = jest.fn().mockResolvedValue(sampleBookings);

      // Call the controller function
      await getAllBookings(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith({
        message: "Bookings fetched successfully",
        bookings: sampleBookings,
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

      // Mock Booking.find to throw an error
      Booking.find = jest.fn().mockRejectedValue(new Error("Mocked Error"));

      // Call the controller function
      await getAllBookings(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith({
        message: "Error fetching bookings",
        error: expect.any(Object),
      });
    });
  });

  describe("makePayment", () => {
    it("should confirm payment and book a flight", async () => {
      // Mock request and response objects
      const req = {
        params: {
          flightId: "flightId1",
        },
      } as unknown as Request;

      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Booking.findOne and Booking.prototype.save
      const mockBooking = {
        isBooked: false,
        save: jest.fn().mockResolvedValue(undefined),
      };
      Booking.findOne = jest.fn().mockResolvedValue(mockBooking);

      // Call the controller function
      await makePayment(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith({
        message: "Payment confirmed and flight booked",
      });
      expect(mockBooking.isBooked).toBe(true);
      expect(mockBooking.save).toHaveBeenCalled();
    });

    it("should return 404 if flight booking not found", async () => {
      // Mock request and response objects
      const req = {
        params: {
          flightId: "nonExistentFlightId",
        },
      } as unknown as Request;

      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ send: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Booking.findOne to return null
      Booking.findOne = jest.fn().mockResolvedValue(null);

      // Call the controller function
      await makePayment(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith({
        message: "Flight booking not found",
      });
    });

    it("should return 404 if flight has already been booked and paid for", async () => {
      // Mock request and response objects
      const req = {
        params: {
          flightId: "flightId1",
        },
      } as unknown as Request;

      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ send: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Booking.findOne to return a booked and paid booking
      Booking.findOne = jest.fn().mockResolvedValue({
        isBooked: true,
      });

      // Call the controller function
      await makePayment(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(sendMock).toHaveBeenCalledWith({
        message: "This flight has already been booked and payed for",
      });
    });

    it("should handle errors", async () => {
      // Mock request and response objects
      const req = {
        params: {
          flightId: "flightId1",
        },
      } as unknown as Request;

      const sendMock = jest.fn();
      const statusMock = jest.fn(() => ({ json: sendMock }));
      const res = {
        status: statusMock,
      } as unknown as Response;

      // Mock Booking.findOne to throw an error
      Booking.findOne = jest.fn().mockRejectedValue(new Error("Mocked Error"));

      // Call the controller function
      await makePayment(req, res);

      // Check if the response was as expected
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(sendMock).toHaveBeenCalledWith({
        message: "Error processing payment",
        error: expect.any(Object),
      });
    });
  });
});
