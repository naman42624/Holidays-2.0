import mongoose, { Document } from 'mongoose';
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
export declare const TourPackage: mongoose.Model<ITourPackage, {}, {}, {}, mongoose.Document<unknown, {}, ITourPackage, {}> & ITourPackage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TourPackage.d.ts.map