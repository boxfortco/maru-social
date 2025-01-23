import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import ProjectCard from "@/components/projects/project-card";
import ProjectCreator from "@/components/projects/project-creator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Clock, TrendingUp, PlusCircle, Award, Search } from "lucide-react";
import { Link } from "wouter";

type ViewMode = "default" | "masonry" | "grid";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">ShowYourWork</h1>
            <ProjectCreator />
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search artworks, artists, or tags..."
                className="w-full pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Sort & Filter
            </Button>
          </div>

          {/* View Options */}
          <div className="flex items-center gap-4">
            <Button
              variant={viewMode === "default" ? "default" : "ghost"}
              onClick={() => setViewMode("default")}
              className="gap-2"
            >
              Latest
            </Button>
            <Button
              variant={viewMode === "masonry" ? "default" : "ghost"}
              onClick={() => setViewMode("masonry")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <Award className="h-4 w-4" />
              Featured
            </Button>
          </div>
        </div>
      </div>

      {/* Project Feed */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className={`grid gap-8 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : viewMode === "masonry" 
            ? "columns-1 md:columns-2 lg:columns-3" 
            : ""
        }`}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} viewMode={viewMode} />
          ))}
        </div>
      </div>
    </div>
  );
}