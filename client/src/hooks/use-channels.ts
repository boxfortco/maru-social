import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Channel } from '@db/schema';
import { useToast } from '@/hooks/use-toast';

async function fetchChannels() {
  const response = await fetch('/api/channels', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Channel[]>;
}

async function createChannel(channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) {
  const response = await fetch('/api/channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(channelData),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Channel>;
}

async function followChannel(channelId: number) {
  const response = await fetch(`/api/channels/${channelId}/follow`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<{ following: boolean }>;
}

async function addProjectToChannel(channelId: number, projectId: number, featured: boolean = false) {
  const response = await fetch(`/api/channels/${channelId}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, featured }),
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export function useChannels() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels
  });

  const createChannelMutation = useMutation({
    mutationFn: createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast({
        title: "Success",
        description: "Channel created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const followChannelMutation = useMutation({
    mutationFn: followChannel,
    onSuccess: (data, channelId) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast({
        title: data.following ? "Following" : "Unfollowed",
        description: data.following ? "You are now following this channel" : "You have unfollowed this channel"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addProjectMutation = useMutation({
    mutationFn: ({ channelId, projectId, featured }: { channelId: number, projectId: number, featured?: boolean }) =>
      addProjectToChannel(channelId, projectId, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast({
        title: "Success",
        description: "Project added to channel"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    channels,
    isLoading,
    createChannel: createChannelMutation.mutateAsync,
    followChannel: followChannelMutation.mutateAsync,
    addProject: addProjectMutation.mutateAsync
  };
}
