import mongoose, { Document, Schema } from 'mongoose';

export type FilterMode = 'blacklist' | 'whitelist';

export interface IWebFilterRule extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  mode: FilterMode;           // blacklist = block listed, whitelist = allow only listed
  url?: string;               // exact URL or domain (e.g. "youtube.com")
  category?: string;          // category-level block (e.g. "adult", "gambling", "violence")
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Predefined blocked categories for age presets
export const CATEGORY_PRESETS: Record<string, string[]> = {
  little_explorer: ['adult', 'gambling', 'violence', 'drugs', 'weapons', 'hate_speech', 'dating', 'horror'],
  junior_learner:  ['adult', 'gambling', 'drugs', 'weapons', 'hate_speech', 'dating'],
  preteen:         ['adult', 'gambling', 'drugs', 'weapons'],
};

const WebFilterRuleSchema = new Schema<IWebFilterRule>({
  child:     { type: Schema.Types.ObjectId, ref: 'Child', required: true, index: true },
  parent:    { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
  mode:      { type: String, enum: ['blacklist', 'whitelist'], default: 'blacklist' },
  url:       { type: String },
  category:  { type: String },
  isEnabled: { type: Boolean, default: true },
}, { timestamps: true });

WebFilterRuleSchema.index({ child: 1, url: 1 });
WebFilterRuleSchema.index({ child: 1, category: 1 });

export default mongoose.model<IWebFilterRule>('WebFilterRule', WebFilterRuleSchema);
