import express, { Router } from 'express';
import { createEvent, fetchEvents, fetchEventById, updateEvent, deleteAllEvents, deleteEvent } from '../controllers/event.js';

const eventRouter = Router();

eventRouter.post('/', createEvent);
eventRouter.get('/', fetchEvents);
eventRouter.get('/:id', fetchEventById);
eventRouter.put('/:id', updateEvent);
eventRouter.delete('/:id', deleteEvent);
eventRouter.delete('/', deleteAllEvents);

export default eventRouter;