import mongoose, { Document } from 'mongoose';
export type AlertType = 'geofence_breach' | 'sos' | 'low_battery' | 'blocked_content' | 'unknown_contact' | 'sim_change' | 'app_install' | 'distress_keyword' | 'cyberbullying' | 'grooming' | 'movement_unusual';
export interface IAlert extends Document {
    child: mongoose.Types.ObjectId;
    parent: mongoose.Types.ObjectId;
    type: AlertType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    isRead: boolean;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAlert, {}, {}, {}, mongoose.Document<unknown, {}, IAlert, {}, mongoose.DefaultSchemaOptions> & IAlert & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAlert>;
export default _default;
