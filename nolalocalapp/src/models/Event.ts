import mongoose, { Schema, Model } from 'mongoose';

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  location: string;
  category: mongoose.Types.ObjectId;
  imageUrl?: string;
  source: 'user' | 'eventbrite' | 'ticketmaster';
  sourceUrl?: string;
  externalId?: string;
  creator?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  status: 'upcoming' | 'passed';
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Event category is required'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['user', 'eventbrite', 'ticketmaster'],
      default: 'user',
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'passed'],
      default: 'upcoming',
    },
    lastSyncedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ creator: 1 });

// Prevent model recompilation in development
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;