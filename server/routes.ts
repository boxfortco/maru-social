import { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import {
  users,
  projects,
  stages,
  createProjectSchema,
} from "@db/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  const { requireAuth } = setupAuth(app);

  // Project routes
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const allProjects = await db.query.projects.findMany({
        with: {
          stages: true,
          user: true
        },
        orderBy: [desc(projects.createdAt)]
      });

      const projectsWithStats = allProjects.map(project => ({
        ...project,
        stages: project.stages.sort((a, b) => a.order - b.order)
      }));

      res.json(projectsWithStats);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).send("Failed to fetch projects: " + error.message);
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const result = createProjectSchema.safeParse(req.body);

      if (!result.success) {
        console.error("Invalid input:", result.error.issues);
        return res.status(400).send("Invalid input: " + result.error.issues.map(issue => issue.message).join(", "));
      }

      const { title, category, stages: stageData } = result.data;
      const now = Math.floor(Date.now() / 1000);

      // Create project and stages in a transaction
      const { project, stages: createdStages } = await db.transaction(async (tx) => {
        const [project] = await tx.insert(projects)
          .values({
            userId: req.session.userId!,
            title,
            category,
            createdAt: now,
            updatedAt: now
          })
          .returning();

        const stagesToCreate = stageData.map((stage, index) => ({
          projectId: project.id,
          stageType: stage.stageType,
          imageUrl: stage.imageUrl,
          description: stage.description,
          order: index,
          createdAt: now
        }));

        const createdStages = await tx.insert(stages)
          .values(stagesToCreate)
          .returning();

        return { project, stages: createdStages };
      });

      res.json({
        ...project,
        stages: createdStages
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).send("Failed to create project: " + error.message);
    }
  });

  // Add DELETE project endpoint
  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.id);
    const userId = req.session.userId!;

    try {
      // First verify that the project belongs to the user
      const [project] = await db.select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!project || project.userId !== userId) {
        return res.status(404).send("Project not found or unauthorized");
      }

      // Delete the project and all related data
      await db.transaction(async (tx) => {
        // Delete stages
        await tx.delete(stages)
          .where(eq(stages.projectId, projectId));

        // Finally delete the project
        await tx.delete(projects)
          .where(eq(projects.id, projectId));
      });

      res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(500).send("Failed to delete project: " + error.message);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}