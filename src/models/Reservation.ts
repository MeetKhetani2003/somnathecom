import { Schema, model, models } from "mongoose";

const ReservationSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, required: true },
  items: [
    {
      productId: { type: Number, required: true },
      quantity: { type: Number, required: true },
      size: { type: String },
    },
  ],
  expiresAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
});

export const Reservation = models.Reservation || model("Reservation", ReservationSchema);
