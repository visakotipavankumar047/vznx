const router = require("express").Router();
const RevenueSnapshot = require("../models/revenue.model");
const Project = require("../models/project.model");
const Task = require("../models/task.model");

router.get("/stats", async (req, res) => {
  try {
    const projects = await Project.find().select("name revenue color");
    const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue || 0), 0);

    res.json({
      totalRevenue,
      projectRevenues: projects.map((p) => ({
        projectId: p._id,
        projectName: p.name,
        projectColor: p.color,
        amount: p.revenue || 0,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch revenue stats", error);
    res.status(500).json({ message: "Failed to fetch revenue stats" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const snapshots = await RevenueSnapshot.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("projectRevenues.project", "name color");

    res.json(snapshots.reverse());
  } catch (error) {
    console.error("Failed to fetch revenue history", error);
    res.status(500).json({ message: "Failed to fetch revenue history" });
  }
});

router.post("/snapshot", async (req, res) => {
  try {
    const projects = await Project.find().select("revenue");
    const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue || 0), 0);

    const projectRevenues = projects
      .filter((p) => p.revenue > 0)
      .map((p) => ({
        project: p._id,
        amount: p.revenue,
      }));

    const snapshot = new RevenueSnapshot({
      totalRevenue,
      projectRevenues,
    });

    await snapshot.save();
    const populated = await snapshot.populate(
      "projectRevenues.project",
      "name color"
    );

    res.status(201).json(populated);
  } catch (error) {
    console.error("Failed to create revenue snapshot", error);
    res.status(400).json({
      message: "Failed to create revenue snapshot",
      error: error.message,
    });
  }
});

router.get("/profit", async (req, res) => {
  try {
    const projects = await Project.find()
      .select("name revenue budget  budgetBreakdown color")
      .lean();

    const tasks = await Task.find()
      .select("project budget")
      .lean();

    const spentByProject = new Map();
    tasks.forEach((task) => {
      const projectId = task.project?.toString();
      if (!projectId) return;
      const current = spentByProject.get(projectId) || 0;
      spentByProject.set(projectId, current + (task.budget || 0));
    });

    const projectProfits = projects.map((p) => {
      const revenue = p.revenue || 0;
      const totalBudget = p.budget || 0;
      const projectId = p._id.toString();
      const spentBudget = spentByProject.get(projectId) || 0;
      const remainingBudget = Math.max(totalBudget - spentBudget, 0);

      const profit = revenue - spentBudget;
      const marginBase = spentBudget > 0 ? spentBudget : totalBudget;
      const margin = marginBase
        ? ((profit / marginBase) * 100).toFixed(2)
        : 0;

      return {
        projectId: p._id,
        projectName: p.name,
        projectColor: p.color,
        revenue,
        budgetTotal: totalBudget,
        budgetSpent: spentBudget,
        budgetRemaining: remainingBudget,
        profit,
        margin: parseFloat(margin),
        budgetBreakdown: p.budgetBreakdown || {
          labor: 0,
          materials: 0,
          overhead: 0,
        },
      };
    });

    const totalRevenue = projectProfits.reduce((sum, p) => sum + p.revenue, 0);
    const totalBudgetTotal = projectProfits.reduce(
      (sum, p) => sum + p.budgetTotal,
      0
    );
    const totalBudgetSpent = projectProfits.reduce(
      (sum, p) => sum + p.budgetSpent,
      0
    );
    const totalBudgetRemaining = projectProfits.reduce(
      (sum, p) => sum + p.budgetRemaining,
      0
    );

    const totalProfit = totalRevenue - totalBudgetSpent;
    const overallMarginBase = totalBudgetSpent || totalBudgetTotal;
    const overallMargin = overallMarginBase
      ? ((totalProfit / overallMarginBase) * 100).toFixed(2)
      : 0;

    res.json({
      overall: {
        totalRevenue,
        // For backward compatibility, expose remaining budget as totalBudget
        totalBudget: totalBudgetRemaining,
        totalBudgetTotal,
        totalBudgetSpent,
        totalBudgetRemaining,
        totalProfit,
        margin: parseFloat(overallMargin),
      },
      projects: projectProfits,
    });
  } catch (error) {
    console.error("Failed to fetch profit analysis", error);
    res.status(500).json({ message: "Failed to fetch profit analysis" });
  }
});

router.get("/trends", async (req, res) => {
  try {
    const range = req.query.range || "30";
    const days = parseInt(range);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshots = await RevenueSnapshot.find({
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: 1 })
      .lean();

    const trends = snapshots.map((snapshot) => ({
      date: snapshot.createdAt,
      revenue: snapshot.totalRevenue,
      timestamp: snapshot.createdAt.getTime(),
    }));

    res.json(trends);
  } catch (error) {
    console.error("Failed to fetch revenue trends", error);
    res.status(500).json({ message: "Failed to fetch revenue trends" });
  }
});

module.exports = router;
