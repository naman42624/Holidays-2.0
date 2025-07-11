import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<ICachedLocation, {}, {}, {}, mongoose.Document<unknown, {}, ICachedLocation, {}> & ICachedLocation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
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
export declare const CachedActivity: mongoose.Model<ICachedActivity, {}, {}, {}, mongoose.Document<unknown, {}, ICachedActivity, {}> & ICachedActivity & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Cache.d.ts.map