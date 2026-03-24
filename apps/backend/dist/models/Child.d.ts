import mongoose, { Document } from 'mongoose';
export interface IChild extends Document {
    name: string;
    age: number;
    parent: mongoose.Types.ObjectId;
    deviceId?: string;
    deviceModel?: string;
    androidVersion?: string;
    fcmToken?: string;
    isPaired: boolean;
    isOnline: boolean;
    lastSeen: Date;
    batteryLevel: number;
    riskScore: number;
    agePreset: 'little_explorer' | 'junior_learner' | 'preteen' | 'custom';
    screenTimeLimit: number;
    bedtimeStart: string;
    bedtimeEnd: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IChild, {}, {}, {}, mongoose.Document<unknown, {}, IChild, {}, mongoose.DefaultSchemaOptions> & IChild & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChild>;
export default _default;
