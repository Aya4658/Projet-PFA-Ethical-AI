import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  id: { type: Number, unique: true, default: () => Date.now() },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  country: { type: String, default: '' }
}, { timestamps: true });

supplierSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret.id ?? ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model('Supplier', supplierSchema);
