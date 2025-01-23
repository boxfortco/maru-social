import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProjects } from "@/hooks/use-projects";
import ProjectCard from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, Columns, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { ViewMode } from "@/types/common";
import { artCategories } from "@db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RecommendedArtists from "@/components/discover/recommended-artists";

// Sample color palettes - in a real app, these would come from the API
const colorPalettes = [
  {
    id: 1,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
    usageCount: 234
  },
  {
    id: 2,
    colors: ['#2C3E50', '#E74C3C', '#ECF0F1', '#3498DB', '#2980B9'],
    usageCount: 186
  }
];

export default function Discover() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { projects, isLoading } = useProjects();
  const [activeTab, setActiveTab] = useState("trending");
  const [, setLocation] = useLocation();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const colorFilter = searchParams.get('color');

  // Filter projects based on search query and category
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === '' || 
      project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearCategoryFilter = () => {
    setSelectedCategory("");
  };

  const clearColorFilter = () => {
    setLocation('/discover');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 max-w-5xl">
          {/* Header */}
          <div className="bg-card border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Discover</h1>
                <div className="flex items-center gap-4">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === "columns" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("columns")}
                  >
                    <Columns className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search artworks, artists, collections..."
                  className="w-full pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-4 mb-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {artCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 mb-4">
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-2">
                    Category: {selectedCategory}
                    <button onClick={clearCategoryFilter}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {colorFilter && (
                  <Badge variant="secondary" className="gap-2">
                    Color: #{colorFilter}
                    <button onClick={clearColorFilter}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="latest">Latest</TabsTrigger>
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "columns-1 md:columns-2 lg:columns-3 gap-6"
            }`}>
              {filteredProjects?.map((project) => (
                <ProjectCard key={project.id} project={project} viewMode={viewMode} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-card p-6">
          {/* Recommended Artists */}
          <RecommendedArtists />

          {/* Trending Color Palettes */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Trending Palettes</h2>
            <div className="space-y-4">
              {colorPalettes.map(palette => (
                <div key={palette.id} className="rounded-lg overflow-hidden">
                  <div className="flex h-12">
                    {palette.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex-1 h-full cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: color }}
                        onClick={() => setLocation(`/discover?color=${color.substring(1)}`)}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {palette.usageCount} artworks
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}