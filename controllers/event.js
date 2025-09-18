import { DateTime } from 'luxon';
import Event from '../models/event.js';
import logger from '../utils/logger.js';

export const createEvent = async (req, res) => {
    logger.info('Create event request body:', req.body);
    const { description, eventTime, timeZone, isRecurring, recurrence } = req.body;
    const viewerTZ = req.query.timeZone || 'UTC';

    try {
        const now = DateTime.now().setZone(timeZone);
        const eventDt = DateTime.fromISO(eventTime, { zone: timeZone });

        if (!now.isValid || !eventDt.isValid) {
            return res.status(400).json({ success: false, message: 'Invalid date/time or time zone' });
        }

        const event = new Event({
            description,
            createdAtLocal: now.toJSDate(),
            createdAtUTC: now.toUTC().toJSDate(),
            updatedAtLocal: now.toJSDate(),
            updatedAtUTC: now.toUTC().toJSDate(),
            eventTimeLocal: eventDt.toJSDate(),
            eventTimeUTC: eventDt.toUTC().toJSDate(),
            originalTimeZone: timeZone,
            isRecurring: isRecurring || false,
            recurrence: isRecurring ? recurrence : {}
        });

        await event.save();
        const response = formatEventForResponse(event, viewerTZ);
        res.status(201).json({ success: true, data: response });
    } catch (error) {
        logger.error('Create event error:', error);
        res.status(500).json({ success: false, message: 'Error creating event' });
    }
};

const getNextOccurrence = (event, viewerTZ = 'UTC') => {
    if (!event.isRecurring || !event.recurrence) return null;

    const { frequency, time, daysOfWeek, dayOfMonth, monthOfYear } = event.recurrence;
    const [hour, minute] = time?.split(':').map(Number) || [0, 0];
    let next = DateTime.fromJSDate(event.eventTimeUTC).setZone(event.originalTimeZone);
    const now = DateTime.now().setZone(event.originalTimeZone);

    switch (frequency) {
        case 'daily':
            next = next.set({ hour, minute });
            if (next <= now) next = next.plus({ days: 1 });
            break;

        case 'weekly':
            if (!daysOfWeek?.length) throw new Error('Missing daysOfWeek');
            const sorted = daysOfWeek.sort((a, b) => a - b);
            let target = sorted.find(d => d >= now.weekday && now < now.set({ weekday: d, hour, minute }));
            if (!target) target = sorted[0] + 7;
            next = now.set({ weekday: target, hour, minute });
            break;

        case 'monthly':
            next = now.set({ day: dayOfMonth, hour, minute });
            if (next <= now) next = next.plus({ months: 1 });
            break;

        case 'yearly':
            next = now.set({ month: monthOfYear, day: dayOfMonth, hour, minute });
            if (next <= now) next = next.plus({ years: 1 });
            break;
    }

    return next.setZone(viewerTZ).toFormat("yyyy-MM-dd'T'HH:mm");
};

const formatEventForResponse = (event, viewerTZ = 'UTC') => {
    const createdAtUTC = DateTime.fromJSDate(event.createdAtUTC, { zone: 'UTC' });
    const updatedAtUTC = DateTime.fromJSDate(event.updatedAtUTC, { zone: 'UTC' });
    const eventTimeUTC = DateTime.fromJSDate(event.eventTimeUTC, { zone: 'UTC' });

    return {
        _id: event._id,
        description: event.description,
        originalTimeZone: event.originalTimeZone,
        isRecurring: event.isRecurring,
        recurrence: event.recurrence || {},

        originalCreatedAt: createdAtUTC.setZone(event.originalTimeZone).toFormat("yyyy-MM-dd'T'HH:mm"),
        yourEquivalentCreatedAt: createdAtUTC.setZone(viewerTZ).toFormat("yyyy-MM-dd'T'HH:mm"),

        originalUpdatedAt: updatedAtUTC.setZone(event.originalTimeZone).toFormat("yyyy-MM-dd'T'HH:mm"),
        yourEquivalentUpdatedAt: updatedAtUTC.setZone(viewerTZ).toFormat("yyyy-MM-dd'T'HH:mm"),

        originalEventTime: eventTimeUTC.setZone(event.originalTimeZone).toFormat("yyyy-MM-dd'T'HH:mm"),
        yourEquivalentEventTime: eventTimeUTC.setZone(viewerTZ).toFormat("yyyy-MM-dd'T'HH:mm"),

        nextOccurrence: event.isRecurring ? getNextOccurrence(event, viewerTZ) : null
    };
};

export const fetchEvents = async (req, res) => {
    const viewerTZ = req.query.timeZone || 'UTC';
    try {
        const events = await Event.find().sort({ createdAtUTC: 1 });
        const formatted = events.map(event => formatEventForResponse(event, viewerTZ));
        res.json({ success: true, data: formatted });
    } catch (error) {
        logger.error('Fetch events error:', error);
        res.status(500).json({ success: false, message: 'Error fetching events' });
    }
};

export const fetchEventById = async (req, res) => {
    const viewerTZ = req.query.timeZone || 'UTC';
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        const response = formatEventForResponse(event, viewerTZ);
        res.json({ success: true, data: response });
    } catch (error) {
        logger.error('Fetch event by ID error:', error);
        res.status(500).json({ success: false, message: 'Error fetching event' });
    }
};

export const updateEvent = async (req, res) => {
    const viewerTZ = req.query.timeZone || 'UTC';
    try {
        const { id } = req.params;
        const { description, eventTime, timeZone, isRecurring, recurrence } = req.body;

        const updatedAt = DateTime.now().setZone(timeZone);
        const eventDt = DateTime.fromISO(eventTime, { zone: timeZone });

        if (!updatedAt.isValid || !eventDt.isValid) {
            return res.status(400).json({ success: false, message: 'Invalid date/time or time zone' });
        }

        const event = await Event.findByIdAndUpdate(id, {
            description,
            eventTimeLocal: eventDt.toJSDate(),
            eventTimeUTC: eventDt.toUTC().toJSDate(),
            updatedAtLocal: updatedAt.toJSDate(),
            updatedAtUTC: updatedAt.toUTC().toJSDate(),
            originalTimeZone: timeZone,
            isRecurring,
            recurrence: isRecurring ? recurrence : {}
        }, { new: true });

        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const response = formatEventForResponse(event, viewerTZ);
        res.json({ success: true, data: response });
    } catch (error) {
        logger.error('Update event error:', error);
        res.status(500).json({ success: false, message: 'Error updating event' });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findByIdAndDelete(id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        logger.error('Delete event error:', error);
        res.status(500).json({ success: false, message: 'Error deleting event' });
    }
};

export const deleteAllEvents = async (req, res) => {
    try {
        await Event.deleteMany();
        res.json({ success: true, message: 'All events deleted successfully' });
    } catch (error) {
        logger.error('Delete all events error:', error);
        res.status(500).json({ success: false, message: 'Error deleting all events' });
    }
};