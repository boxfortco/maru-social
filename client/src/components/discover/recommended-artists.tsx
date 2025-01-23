import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type RecommendedArtist = {
  id: number;
  username: string;
  projectCount: number;
  likeCount: number;
  category: string;
  recentProjects: Array<{
    id: number;
    title: string;
    category: string;
    stages: Array<{
      id: number;
      imageUrl: string;
      stageType: string;
    }>;
    stats: {
      likes: number;
      comments: number;
    };
  }>;
};

export default function RecommendedArtists() {
  const { data: recommendations = [], isLoading } = useQuery<RecommendedArtist[]>({
    queryKey: ["/api/recommendations"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Recommended Artists</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {recommendations.map((artist) => (
            <Card key={artist.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{artist.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      {artist.projectCount} projects · {artist.likeCount} likes
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Follow</Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {artist.recentProjects.map((project) => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <a className="block group relative">
                        <div className="aspect-square overflow-hidden rounded-md">
                          <img 
                            src={project.stages[project.stages.length - 1].imageUrl} 
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-sm space-y-1">
                            <p className="font-medium">{project.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {project.stats.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {project.stats.comments}
                              </span>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>

                <div className="mt-2">
                  <Badge variant="secondary">{artist.category}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
