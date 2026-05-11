import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: '' },
  data: { type: String, default: '' },
  expiry: { type: String, default: '' },
  status: { type: String, default: 'pending' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true, default: () => Date.now() },
  name: { type: String, default: '' },
  sku: { type: String, default: '' },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  producer: { type: String, default: '' },
  country: { type: String, default: '' },
  alertThreshold: { type: Number, default: 5 },
  certificates: { type: [certificateSchema], default: [] }
}, { timestamps: true });

productSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret.id ?? ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.model('Product', productSchema);
