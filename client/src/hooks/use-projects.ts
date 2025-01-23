import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/types/common";
import type { Stage } from "@db/schema";
import { z } from "zod";
import { artCategories, stageTypes } from "@db/schema";

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(artCategories),
  stages: z.array(z.object({
    stageType: z.enum(stageTypes),
    imageUrl: z.string().url(),
    description: z.string().optional()
  })).min(1, "At least one stage is required")
});

type CreateProjectData = z.infer<typeof createProjectSchema>;

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status >= 500) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }

        throw new Error(`${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      // Convert Date objects to strings
      return data.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt).toISOString(),
        updatedAt: new Date(project.updatedAt).toISOString(),
        stages: project.stages?.map((stage: any) => ({
          ...stage,
          createdAt: new Date(stage.createdAt).toISOString()
        }))
      }));
    }
  });

  const createProject = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: number) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  return {
    projects,
    isLoading,
    createProject: createProject.mutateAsync,
    deleteProject: deleteProject.mutateAsync,
  };
}