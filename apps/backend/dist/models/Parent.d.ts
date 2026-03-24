import mongoose, { Document } from 'mongoose';
export interface IParent extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    fcmToken?: string;
    consentSigned: boolean;
    consentSignedAt?: Date;
    subscription: 'free' | 'standard' | 'premium' | 'family_plus';
    children: mongoose.Types.ObjectId[];
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IParent, {}, {}, {}, mongoose.Document<unknown, {}, IParent, {}, mongoose.DefaultSchemaOptions> & IParent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IParent>;
export default _default;
