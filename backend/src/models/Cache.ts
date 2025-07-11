import mongoose, { Document, Schema } from 'mongoose';

export interface ICachedLocation extends Document {
  _id: mongoose.Types.ObjectId;
  keyword: string;
  searchParams: object;
  data: any[];
  meta: object;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const CachedLocationSchema = new Schema<ICachedLocation>(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    searchParams: {
      type: Schema.Types.Mixed,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
CachedLocationSchema.index({ keyword: 1, searchParams: 1 });
CachedLocationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model<ICachedLocation>('CachedLocation', CachedLocationSchema);

export interface ICachedActivity extends Document {
  _id: mongoose.Types.ObjectId;
  locationKey: string;
  searchParams: object;
  data: any[];
  meta: object;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const CachedActivitySchema = new Schema<ICachedActivity>(
  {
    locationKey: {
      type: String,
      required: true,
    },
    searchParams: {
      type: Schema.Types.Mixed,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
CachedActivitySchema.index({ locationKey: 1, searchParams: 1 });
CachedActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const CachedActivity = mongoose.model<ICachedActivity>('CachedActivity', CachedActivitySchema);
