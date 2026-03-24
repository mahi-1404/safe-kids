import mongoose, { Document } from 'mongoose';
export interface IAppUsage {
    appName: string;
    packageName: string;
    category: string;
    durationMinutes: number;
}
export interface IScreenTime extends Document {
    child: mongoose.Types.ObjectId;
    date: string;
    totalMinutes: number;
    apps: IAppUsage[];
    createdAt: Date;
}
declare const _default: mongoose.Model<IScreenTime, {}, {}, {}, mongoose.Document<unknown, {}, IScreenTime, {}, mongoose.DefaultSchemaOptions> & IScreenTime & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IScreenTime>;
export default _default;
