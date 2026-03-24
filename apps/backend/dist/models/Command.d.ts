import mongoose, { Document } from 'mongoose';
export type CommandType = 'lock_device' | 'unlock_device' | 'wipe_device' | 'ring_device' | 'send_message' | 'toggle_wifi' | 'restart_device' | 'pause_apps' | 'resume_apps' | 'update_settings';
export interface ICommand extends Document {
    child: mongoose.Types.ObjectId;
    parent: mongoose.Types.ObjectId;
    type: CommandType;
    payload?: Record<string, unknown>;
    status: 'pending' | 'delivered' | 'executed' | 'failed';
    createdAt: Date;
}
declare const _default: mongoose.Model<ICommand, {}, {}, {}, mongoose.Document<unknown, {}, ICommand, {}, mongoose.DefaultSchemaOptions> & ICommand & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICommand>;
export default _default;
