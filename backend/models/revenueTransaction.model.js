const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const revenueTransactionSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Milestone", "Retainer", "Final Payment", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Pending", "Received", "Overdue"],
      default: "Pending",
    },
    invoiceId: { type: String },
  },
  {
    timestamps: true,
  }
);

const RevenueTransaction = mongoose.model(
  "RevenueTransaction",
  revenueTransactionSchema
);

module.exports = RevenueTransaction;
