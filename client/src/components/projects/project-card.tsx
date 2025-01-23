import { Link } from "wouter";
import { type Project } from "@/types/common";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, MessageSquare, AlertTriangle, Flag } from "lucide-react";
import type { ViewMode } from "@/types/common";
import ContentFlagDialog from "./content-flag-dialog";
import { Button } from "@/components/ui/button";

type ProjectCardProps = {
  project: Project;
  viewMode: ViewMode;
};

type ProjectStats = {
  flags?: number;
  flagConfidence?: number;
  likes?: number;
  views?: number;
  comments?: number;
};

export default function ProjectCard({ project, viewMode }: ProjectCardProps) {
  // Get the latest stage image (or null if no stages)
  const latestStage = project.stages?.[project.stages.length - 1];
  const firstStage = project.stages?.[0];

  const renderFlagWarning = (stats?: ProjectStats) => {
    if (!stats?.flags || !stats.flagConfidence) return null;

    const confidence = stats.flagConfidence;
    if (confidence < 0.5) return null;

    return (
      <div className={`absolute top-2 left-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
        confidence > 0.8 ? 'bg-destructive/90' : 'bg-yellow-500/90'
      } text-white shadow-sm`}>
        <AlertTriangle className="h-3 w-3" />
        {confidence > 0.8 ? 'AI Generated' : 'Suspected AI Content'}
      </div>
    );
  };

  // Default view shows the latest stage large with thumbnails
  if (viewMode === "default") {
    return (
      <Card className="overflow-hidden">
        <Link href={`/project/${project.id}`}>
          <a>
            <CardContent className="p-4">
              {latestStage && (
                <div className="aspect-video relative">
                  <img
                    src={latestStage.imageUrl}
                    alt={project.title}
                    className="rounded-lg w-full h-full object-cover"
                  />
                  {renderFlagWarning(project.stats)}
                  <Badge className="absolute top-2 right-2">
                    {latestStage.stageType}
                  </Badge>
                </div>
              )}
              <div className="mt-4">
                <h3 className="font-semibold">{project.title}</h3>
                <Badge variant="secondary" className="mt-1">
                  {project.category}
                </Badge>
              </div>
              {project.stages && project.stages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {project.stages.slice(0, -1).map((stage) => (
                    <div key={stage.id} className="aspect-square">
                      <img
                        src={stage.imageUrl}
                        alt={stage.stageType}
                        className="rounded w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </a>
        </Link>
        <CardFooter className="px-4 py-3 border-t flex justify-between">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {project.stats?.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {project.stats?.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {project.stats?.comments || 0}
            </span>
          </div>
          <ContentFlagDialog projectId={project.id}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Flag className="h-4 w-4" />
            </Button>
          </ContentFlagDialog>
        </CardFooter>
      </Card>
    );
  }

  // Masonry, grid, and columns views show only the latest stage
  return (
    <Card className={viewMode === "masonry" || viewMode === "columns" ? "mb-4" : ""}>
      <Link href={`/project/${project.id}`}>
        <a>
          <CardContent className="p-4">
            {latestStage && (
              <div className="relative">
                <img
                  src={latestStage.imageUrl}
                  alt={project.title}
                  className="rounded-lg w-full"
                />
                {renderFlagWarning(project.stats)}
                <Badge className="absolute top-2 right-2">
                  {latestStage.stageType}
                </Badge>
              </div>
            )}
            <div className="mt-4">
              <h3 className="font-semibold">{project.title}</h3>
              <Badge variant="secondary" className="mt-1">
                {project.category}
              </Badge>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {project.stats?.likes || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {project.stats?.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {project.stats?.comments || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </a>
      </Link>
    </Card>
  );
}