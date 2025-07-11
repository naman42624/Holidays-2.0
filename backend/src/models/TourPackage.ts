import mongoose, { Document, Schema } from 'mongoose';

export interface Activity {
  name: string;
  description: string;
  duration: string;
  included: boolean;
}

export interface ITourPackage extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  duration: string;
  imageUrl: string;
  activities: Activity[];
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<Activity>({
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
  },
  duration: {
    type: String,
    required: [true, 'Activity duration is required'],
  },
  included: {
    type: Boolean,
    default: true,
  },
});

const TourPackageSchema = new Schema<ITourPackage>(
  {
    title: {
      type: String,
      required: [true, 'Tour package title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Tour package description is required'],
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Tour package price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: String,
      required: [true, 'Tour package duration is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Tour package image URL is required'],
    },
    activities: {
      type: [ActivitySchema],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Add text index for search functionality
TourPackageSchema.index({ title: 'text', description: 'text' });

export const TourPackage = mongoose.model<ITourPackage>('TourPackage', TourPackageSchema);
