import { z } from 'zod';

export const createBookingSchema: any = z.object({
    firstName: z.string(),
    lastName: z.string(),
  });
  
export  const createAirlineSchema = z.object({
    name: z.string().min(1), 
    flights: z.array(z.unknown()),
});

const createFlightSchema = z.object({
    departureCity: z.string().min(1),
    destinationCity: z.string().min(1),
    price: z.number().min(0),
    date: z.string(),
});

const userInputSchema = z.object({
    destinationCity: z.string().min(1),
    departureCity: z.string().min(1),
    date: z.string(),
  });