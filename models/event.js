import mongoose from 'mongoose';

const recurrenceSchema = new mongoose.Schema({
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: null },
    time: { type: String },
    daysOfWeek: [{ type: Number }],
    dayOfMonth: { type: Number },
    monthOfYear: { type: Number }
}, { _id: false });

const eventSchema = new mongoose.Schema({
    description: { type: String, required: true },

    // Times stored as JS Dates
    createdAtLocal: { type: Date, required: true },
    createdAtUTC: { type: Date, required: true },
    updatedAtLocal: { type: Date, required: true },
    updatedAtUTC: { type: Date, required: true },
    eventTimeLocal: { type: Date, required: true },
    eventTimeUTC: { type: Date, required: true },

    originalTimeZone: { type: String, required: true },

    isRecurring: { type: Boolean, default: false },
    recurrence: { type: recurrenceSchema, default: {} }
});

eventSchema.virtual('createdAtLocalISO').get(function() {
    return this.createdAtLocal.toISOString();
});
eventSchema.virtual('createdAtUTCISO').get(function() {
    return this.createdAtUTC.toISOString();
});

export default mongoose.model('Event', eventSchema);