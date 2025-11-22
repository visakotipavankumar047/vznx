"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./Input";
import { Button } from "./Button";
import { api } from "@/lib/api";
import { Wand2, Loader2, AlertCircle } from "lucide-react";

const getDefaultBreakdown = () => ({
  labor: 0,
  materials: 0,
  overhead: 0,
});

const calculateBudgetBreakdown = (totalBudget) => {
  const total = Number(totalBudget) || 0;
  if (total <= 0) {
    return getDefaultBreakdown();
  }
  const labor = Math.round(total * 0.65);
  const materials = Math.round(total * 0.25);
  const overhead = Math.max(total - labor - materials, 0);
  return { labor, materials, overhead };
};

const hasBreakdownValues = (breakdown) =>
  ["labor", "materials", "overhead"].some(
    (key) => Number(breakdown?.[key]) > 0
  );

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  status: z.enum(["Planned", "In Progress", "At Risk", "Completed"]),
  progress: z.number().min(0).max(100).or(z.string().transform(Number)),
  studio: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  color: z.string().optional(),
  projectLead: z.string().optional(),
  budget: z
    .number()
    .min(0)
    .or(z.string().transform((val) => (val === "" ? 0 : Number(val))))
    .optional(),
  budgetBreakdown: z
    .object({
      labor: z.number().default(0),
      materials: z.number().default(0),
      overhead: z.number().default(0),
    })
    .optional(),
});

export function ProjectForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || "",
      status: initialData?.status || "Planned",
      progress: initialData?.progress || 0,
      studio: initialData?.studio || "Core Studio",
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate).toISOString().split("T")[0]
        : "",
      notes: initialData?.notes || "",
      color: initialData?.color || "#2563eb",
      projectLead:
        (typeof initialData?.projectLead === "object"
          ? initialData?.projectLead?._id
          : initialData?.projectLead) || "",
      budget: initialData?.budget || 0,
      budgetBreakdown: initialData?.budgetBreakdown || getDefaultBreakdown(),
    },
  });

  const progress = watch("progress");
  const budget = watch("budget");
  const budgetBreakdown = watch("budgetBreakdown");

  const derivedBudgetBreakdown = useMemo(() => {
    const current = budgetBreakdown || getDefaultBreakdown();
    return hasBreakdownValues(current)
      ? current
      : calculateBudgetBreakdown(budget);
  }, [budgetBreakdown, budget]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await api.getTeamMembers();
        setTeamMembers(members);
      } catch (err) {
        console.error("Failed to load team members", err);
      }
    };
    fetchTeamMembers();
  }, []);

  const handleSuggestBudget = async () => {
    const name = getValues("name");
    const status = getValues("status");
    const notes = getValues("notes");
    const projectLeadId = getValues("projectLead");

    if (!name) {
      setAiError("Please enter a project name first");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiSuggestion(null);

    try {
      const projectLead = teamMembers.find((m) => m._id === projectLeadId);

      const suggestion = await api.suggestBudget({
        name,
        status,
        notes,
        projectLead,
      });

      if (suggestion.success) {
        setAiSuggestion(suggestion);
        setValue("budget", suggestion.totalBudget);
        setValue("budgetBreakdown", suggestion.breakdown);
      } else {
        setAiError(
          "Could not generate a suggestion. Using standard estimates."
        );
        setValue("budget", suggestion.totalBudget);
        setValue("budgetBreakdown", suggestion.breakdown);
      }
    } catch (err) {
      console.error("AI Budget Suggestion failed:", err);
      setAiError("Failed to get AI suggestion. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFormSubmit = (formData) => {
    const normalizedBudget = Number(formData.budget) || 0;
    const normalizedBreakdown = hasBreakdownValues(formData.budgetBreakdown)
      ? formData.budgetBreakdown
      : calculateBudgetBreakdown(normalizedBudget);
    onSubmit({
      ...formData,
      budget: normalizedBudget,
      budgetBreakdown: normalizedBreakdown,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Project Details
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name *
          </label>
          <Input {...register("name")} placeholder="Enter project name" />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status *
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="At Risk">At Risk</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Lead
            </label>
            <select
              {...register("projectLead")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Lead</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Progress (%) *
          </label>
          <Input
            {...register("progress", { valueAsNumber: true })}
            type="number"
            min="0"
            max="100"
            placeholder="0"
          />
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {progress || 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Budget & Financials
          </h3>
          <button
            type="button"
            onClick={handleSuggestBudget}
            disabled={aiLoading}
            className="text-xs flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            {aiLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="h-3 w-3" />
            )}
            {aiLoading ? "Analyzing..." : "Suggest Budget (AI)"}
          </button>
        </div>

        {aiError && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {aiError}
          </div>
        )}

        {aiSuggestion && (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm">
            <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">
              AI Suggestion:
            </p>
            <p className="text-purple-800 dark:text-purple-200 italic">
              {aiSuggestion.justification}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Total Budget ($)
          </label>
          <Input
            {...register("budget", { valueAsNumber: true })}
            type="number"
            min="0"
            placeholder="0.00"
            className="font-mono"
          />
        </div>

        {budget > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Budget Breakdown
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="block text-gray-500 text-xs">Labor</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  $
                  {new Intl.NumberFormat("en-US").format(
                    derivedBudgetBreakdown.labor || 0
                  )}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Materials</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  $
                  {new Intl.NumberFormat("en-US").format(
                    derivedBudgetBreakdown.materials || 0
                  )}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Overhead</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  $
                  {new Intl.NumberFormat("en-US").format(
                    derivedBudgetBreakdown.overhead || 0
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Additional Info
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Studio
            </label>
            <Input {...register("studio")} placeholder="Core Studio" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <Input {...register("dueDate")} type="date" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            {...register("notes")}
            placeholder="Project notes..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color
          </label>
          <Input {...register("color")} type="color" />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Update Project"
            : "Create Project"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
