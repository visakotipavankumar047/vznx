"use client";

import { Users } from "lucide-react";

export default function AssignedMembers({ tasks = [] }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <Users className="h-3 w-3" />
        <span>No assignments</span>
      </div>
    );
  }

  const assignedMembers = new Map();

  tasks.forEach((task) => {
    if (task.assignee && typeof task.assignee === "object") {
      const memberId = task.assignee._id || task.assignee.id;
      if (memberId && !assignedMembers.has(memberId)) {
        assignedMembers.set(memberId, {
          name: task.assignee.name,
          role: task.assignee.role,
        });
      }
    }
  });

  const members = Array.from(assignedMembers.values());

  if (members.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <Users className="h-3 w-3" />
        <span>No assignments</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
        <Users className="h-3 w-3" />
        <span className="font-medium">Assigned to:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {members.map((member, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full px-2.5 py-1"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-blue-900 dark:text-blue-100 leading-tight">
                {member.name}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 leading-tight">
                {member.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
