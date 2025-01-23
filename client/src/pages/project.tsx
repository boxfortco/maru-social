import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useProjects } from "@/hooks/use-projects";
import { useUser } from "@/hooks/use-user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StageUpload from "@/components/projects/stage-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Share2, MessageSquare, Send, Flag, UserCheck, UserPlus } from "lucide-react";
import ReactCompareImage from "react-compare-image";
import ColorPalette from "@/components/projects/color-palette";
import { formatDistance } from "date-fns";
import ContentFlagDialog from "@/components/projects/content-flag-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function formatTimestamp(timestamp: number | null | undefined) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return '';
  return formatDistance(date, new Date(), { addSuffix: true });
}

export default function Project() {
  const [, params] = useRoute<{ id: string }>("/project/:id");
  const { projects } = useProjects();
  const { user } = useUser();
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  if (!params?.id) return <div>Invalid project ID</div>;
  const projectId = parseInt(params.id);

  const project = projects.find(p => p.id === projectId);
  if (!project) return <div>Project not found</div>;

  // Get author details
  const { data: author } = useQuery({
    queryKey: [`/api/users/${project.userId}`],
  });

  const { data: comments = [] } = useQuery({
    queryKey: [`/api/projects/${projectId}/comments`],
  });

  const { data: likes } = useQuery({
    queryKey: [`/api/projects/${projectId}/likes`],
  });

  const { data: isFollowing } = useQuery({
    queryKey: [`/api/users/${project.userId}/following`],
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/comments`] });
      setComment("");
    }
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/likes`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/likes`] });
    }
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${project.userId}/follow`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${project.userId}/following`] });
    }
  });

  const firstStage = project.stages?.[0];
  const lastStage = project.stages?.[project.stages.length - 1];
  const hasMultipleStages = project.stages && project.stages.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header with project info and author */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="flex items-center gap-4 mt-4">
                <Link href={`/users/${project.userId}`}>
                  <a className="flex items-center gap-2 hover:text-primary">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={author?.avatarUrl} alt={author?.username} />
                      <AvatarFallback>{author?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{author?.username}</span>
                  </a>
                </Link>
                {user?.id !== project.userId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFollow.mutate()}
                    className="gap-2"
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Badge variant="secondary" className="mt-2">
                {project.category}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={likes?.liked ? "default" : "outline"} 
                size="icon"
                onClick={() => toggleLike.mutate()}
              >
                <Heart className={`h-4 w-4 ${likes?.liked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Color Palettes */}
          {project.stages && (
            <ColorPalette stages={project.stages} />
          )}

          {/* Comparison Slider */}
          {hasMultipleStages && firstStage && lastStage && (
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Progress Comparison</h2>
                <div className="relative">
                  <div className="aspect-video">
                    <ReactCompareImage
                      leftImage={firstStage.imageUrl}
                      rightImage={lastStage.imageUrl}
                      leftImageLabel={firstStage.stageType}
                      rightImageLabel={lastStage.stageType}
                      sliderLineWidth={2}
                      handleSize={40}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Stages */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Stages</h2>
            <div className="grid grid-cols-1 gap-6">
              {project.stages?.map((stage) => (
                <Card key={stage.id}>
                  <CardContent className="p-6">
                    <div className="aspect-[4/3] relative max-w-4xl mx-auto">
                      <img
                        src={stage.imageUrl}
                        alt={stage.stageType}
                        className="rounded-lg w-full h-full object-contain"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <Badge>{stage.stageType}</Badge>
                        <ContentFlagDialog projectId={project.id}>
                          <Button variant="secondary" size="icon">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </ContentFlagDialog>
                      </div>
                    </div>
                    {stage.description && (
                      <p className="mt-4 text-sm text-muted-foreground">
                        {stage.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({comments.length})
            </h2>

            {/* Comment Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button 
                variant="outline" 
                size="icon"
                disabled={!comment.trim()}
                onClick={() => addComment.mutate(comment)}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <Link href={`/users/${comment.user.id}`}>
                        <a className="flex items-center gap-2 hover:text-primary">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} />
                            <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{comment.user.username}</span>
                        </a>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(comment.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {user?.id === project.userId && (
            <StageUpload projectId={project.id} />
          )}
        </div>
      </div>
    </div>
  );
}