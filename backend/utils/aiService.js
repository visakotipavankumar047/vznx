const { GoogleGenerativeAI } = require("@google/generative-ai");
const TeamMember = require("../models/teamMember.model");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const TASK_LIMIT = 5;

function pickFallbackMember(candidatePool, label) {
  const fallbackMember = candidatePool.reduce((best, current) => {
    if (current.incompleteTasks < best.incompleteTasks) return current;
    if (
      current.incompleteTasks === best.incompleteTasks &&
      current.totalTasks < best.totalTasks
    ) {
      return current;
    }
    return best;
  });

  console.log(
    `[${label}] Task assigned to ${fallbackMember.name} (Incomplete: ${fallbackMember.incompleteTasks}, Total: ${fallbackMember.totalTasks}/${TASK_LIMIT})`
  );

  return fallbackMember.id;
}

async function assignTaskToOptimalMember(taskRole) {
  let candidatePool = [];

  try {
    if (!taskRole) {
      return null;
    }

    const teamMembers = await TeamMember.find({ role: taskRole }).populate({
      path: "tasks",
      select: "status",
    });

    if (!teamMembers || teamMembers.length === 0) {
      return null;
    }

    const membersWithWorkload = teamMembers
      .map((member) => {
        const totalTasks = member.tasks.length;
        const incompleteTasks = member.tasks.filter(
          (t) => t.status !== "Complete"
        ).length;
        const completedTasks = totalTasks - incompleteTasks;

        return {
          id: member._id.toString(),
          name: member.name,
          role: member.role,
          capacity: member.capacity,
          totalTasks,
          incompleteTasks,
          completedTasks,
          workload: member.workload,
          isAtLimit: totalTasks >= TASK_LIMIT,
        };
      })
      .filter((member) => !member.isAtLimit);

    if (membersWithWorkload.length === 0) {
      console.log("[AI Assignment] All team members at task limit (5 tasks)");
      return null;
    }

    const membersWithModerateTasks = membersWithWorkload.filter(
      (m) => m.incompleteTasks >= 2 && m.incompleteTasks <= 3
    );

    candidatePool =
      membersWithModerateTasks.length > 0
        ? membersWithModerateTasks
        : membersWithWorkload;

    // If there is no valid Gemini key, skip the API call and use local fallback logic.
    if (!process.env.GEMINI_API_KEY) {
      return pickFallbackMember(candidatePool, "AI Assignment Local Fallback (no key)");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro" });

    const prompt = `You are a task assignment expert. Analyze the following team members and determine which one should be assigned a new task.

Team Members:
${JSON.stringify(candidatePool, null, 2)}

Rules:
1. Choose from candidates who have NOT reached the 5-task limit
2. Prefer members with 2-3 incomplete tasks (moderate workload)
3. Among similar workloads, choose the one with LOWEST incomplete task count
4. Avoid overloading any single person

Respond with ONLY the team member's ID (the 'id' field), nothing else. No explanation, just the ID.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const assigneeId = response.text().trim();

    const selectedMember = candidatePool.find((m) => m.id === assigneeId);

    if (selectedMember) {
      console.log(
        `[AI Assignment] Task assigned to ${selectedMember.name} (Incomplete: ${selectedMember.incompleteTasks}, Total: ${selectedMember.totalTasks}/${TASK_LIMIT})`
      );
      return assigneeId;
    }

    return pickFallbackMember(candidatePool, "AI Assignment Fallback");
  } catch (error) {
    console.error("[AI Service Error]", error.message);

    // If Gemini fails (invalid key, network error, etc.), still try to assign using local logic.
    if (candidatePool && candidatePool.length > 0) {
      return pickFallbackMember(
        candidatePool,
        "AI Assignment Local Fallback after error"
      );
    }

    return null;
  }
}

module.exports = {
  assignTaskToOptimalMember,
};
