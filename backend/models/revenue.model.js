const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const revenueSnapshotSchema = new Schema(
  {
    totalRevenue: { type: Number, required: true, default: 0 },
    projectRevenues: [
      {
        project: { type: Schema.Types.ObjectId, ref: "Project" },
        amount: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const RevenueSnapshot = mongoose.model(
  "RevenueSnapshot",
  revenueSnapshotSchema
);

module.exports = RevenueSnapshot;
