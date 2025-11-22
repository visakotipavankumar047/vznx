"use client";

import { Users, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function AssignedMembersCards({ projects = [] }) {
  const [expandedCards, setExpandedCards] = useState(new Set());
  const memberStats = new Map();
  const projectMembersMap = new Map();

  projects.forEach((project) => {
    const members = new Set();

    if (project.projectLead && typeof project.projectLead === "object") {
      const leadId = project.projectLead._id || project.projectLead.id;
      if (leadId) {
        members.add(
          JSON.stringify({
            id: leadId,
            name: project.projectLead.name,
            role: project.projectLead.role,
          })
        );
      }
    }

    if (project.tasks && Array.isArray(project.tasks)) {
      project.tasks.forEach((task) => {
        if (task.assignee && typeof task.assignee === "object") {
          const assigneeId = task.assignee._id || task.assignee.id;
          if (assigneeId) {
            members.add(
              JSON.stringify({
                id: assigneeId,
                name: task.assignee.name,
                role: task.assignee.role,
              })
            );
          }
        }
      });
    }

    projectMembersMap.set(project._id, {
      name: project.name,
      members: Array.from(members).map((m) => JSON.parse(m)),
    });
  });

  projects.forEach((project) => {
    if (project.tasks && Array.isArray(project.tasks)) {
      project.tasks.forEach((task) => {
        if (task.assignee && typeof task.assignee === "object") {
          const memberId = task.assignee._id || task.assignee.id;
          if (memberId) {
            if (!memberStats.has(memberId)) {
              memberStats.set(memberId, {
                name: task.assignee.name,
                role: task.assignee.role,
                projectsData: [],
                taskCount: 0,
              });
            }
            const stats = memberStats.get(memberId);
            if (!stats.projectsData.find((p) => p.id === project._id)) {
              const projectData = projectMembersMap.get(project._id);
              stats.projectsData.push({
                id: project._id,
                name: project.name,
                otherMembers: projectData.members.filter(
                  (m) => m.id !== memberId
                ),
              });
            }
            stats.taskCount += 1;
          }
        }
      });
    }

    if (project.projectLead && typeof project.projectLead === "object") {
      const leadId = project.projectLead._id || project.projectLead.id;
      if (leadId) {
        if (!memberStats.has(leadId)) {
          memberStats.set(leadId, {
            name: project.projectLead.name,
            role: project.projectLead.role,
            projectsData: [],
            taskCount: 0,
            isLead: true,
          });
        }
        const stats = memberStats.get(leadId);
        stats.isLead = true;
        if (!stats.projectsData.find((p) => p.id === project._id)) {
          const projectData = projectMembersMap.get(project._id);
          stats.projectsData.push({
            id: project._id,
            name: project.name,
            otherMembers: projectData.members.filter((m) => m.id !== leadId),
          });
        }
      }
    }
  });

  const members = Array.from(memberStats.entries()).map(([id, data]) => ({
    id,
    ...data,
  }));

  if (members.length === 0) {
    return null;
  }

  const colors = [
    "from-blue-500 to-purple-600",
    "from-green-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-yellow-500 to-orange-600",
  ];

  const toggleCard = (id) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
          Team Members
        </h3>
        <span className="text-sm md:text-base text-gray-500">
          ({members.length} members)
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member, index) => {
          const isExpanded = expandedCards.has(member.id);
          return (
            <div
              key={member.id}
              className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${
                      colors[index % colors.length]
                    } flex items-center justify-center text-white text-lg md:text-xl lg:text-2xl font-bold flex-shrink-0`}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base lg:text-lg truncate">
                        {member.name}
                      </h4>
                      {member.isLead && (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] md:text-xs font-medium rounded">
                          LEAD
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs md:text-sm mb-3">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Briefcase className="h-3 w-3 md:h-4 md:w-4" />
                    <span>
                      {member.projectsData.length} project
                      {member.projectsData.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {member.taskCount > 0 && (
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <span>•</span>
                      <span>
                        {member.taskCount} task
                        {member.taskCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {member.projectsData.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <button
                      onClick={() => toggleCard(member.id)}
                      className="flex items-center justify-between w-full text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span>Projects & Team</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                        {member.projectsData.map((project) => (
                          <div
                            key={project.id}
                            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2"
                          >
                            <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {project.name}
                            </p>
                            {project.otherMembers.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.otherMembers.map((m, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] md:text-xs text-gray-600 dark:text-gray-400"
                                  >
                                    {m.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            {project.otherMembers.length === 0 && (
                              <p className="text-[10px] md:text-xs text-gray-500 italic">
                                Solo on this project
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
