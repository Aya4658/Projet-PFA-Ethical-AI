import mongoose from 'mongoose';

const blockchainEventSchema = new mongoose.Schema({
  ts: { type: Number, default: () => Date.now() },
  productId: { type: Number, required: true },
  action: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: false });

blockchainEventSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model('BlockchainEvent', blockchainEventSchema);
