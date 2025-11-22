const router = require("express").Router();
const RevenueTransaction = require("../models/revenueTransaction.model");
const Project = require("../models/project.model");

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await RevenueTransaction.find()
      .populate("project", "name color")
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Failed to fetch revenue transactions", error);
    res.status(500).json({ message: "Failed to fetch revenue transactions" });
  }
});

// Create a new transaction
router.post("/", async (req, res) => {
  try {
    const { project, amount, date, description, category, status, invoiceId } =
      req.body;

    if (!project || !amount || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const transaction = new RevenueTransaction({
      project,
      amount,
      date: date || new Date(),
      description,
      category,
      status,
      invoiceId,
    });

    const savedTransaction = await transaction.save();

    // Optionally update project revenue if status is Received
    if (status === "Received") {
      await Project.findByIdAndUpdate(project, {
        $inc: { revenue: amount },
      });
    }

    const populated = await savedTransaction.populate("project", "name color");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Failed to create revenue transaction", error);
    res.status(400).json({
      message: "Failed to create revenue transaction",
      error: error.message,
    });
  }
});

// Update a transaction
router.put("/:id", async (req, res) => {
  try {
    const { status, amount } = req.body;
    const oldTransaction = await RevenueTransaction.findById(req.params.id);

    if (!oldTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Handle revenue updates on project if status changes
    if (oldTransaction.status !== "Received" && status === "Received") {
      await Project.findByIdAndUpdate(oldTransaction.project, {
        $inc: { revenue: amount || oldTransaction.amount },
      });
    } else if (
      oldTransaction.status === "Received" &&
      status !== "Received" &&
      status !== undefined
    ) {
      await Project.findByIdAndUpdate(oldTransaction.project, {
        $inc: { revenue: -oldTransaction.amount },
      });
    }

    const updated = await RevenueTransaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("project", "name color");

    res.json(updated);
  } catch (error) {
    console.error("Failed to update revenue transaction", error);
    res.status(400).json({
      message: "Failed to update revenue transaction",
      error: error.message,
    });
  }
});

// Delete a transaction
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await RevenueTransaction.findByIdAndDelete(
      req.params.id
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Revert project revenue if it was received
    if (transaction.status === "Received") {
      await Project.findByIdAndUpdate(transaction.project, {
        $inc: { revenue: -transaction.amount },
      });
    }

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Failed to delete revenue transaction", error);
    res.status(500).json({ message: "Failed to delete revenue transaction" });
  }
});

module.exports = router;
