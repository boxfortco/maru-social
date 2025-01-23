import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ContentFlagDialogProps = {
  projectId: number;
  children: React.ReactNode;
};

export default function ContentFlagDialog({ projectId, children }: ContentFlagDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitFlag = useMutation({
    mutationFn: async (data: { reason: string; evidence: string }) => {
      const res = await fetch(`/api/projects/${projectId}/flags`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      setIsOpen(false);
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community authentic.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for flagging this content.",
        variant: "destructive",
      });
      return;
    }

    submitFlag.mutate({ reason, evidence });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report AI-Generated Content</DialogTitle>
          <DialogDescription>
            Help us maintain the authenticity of our community by reporting suspected AI-generated content.
            Please provide specific details and evidence to support your report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for reporting</label>
            <Textarea
              placeholder="Explain why you believe this is AI-generated content..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Evidence (optional)</label>
            <Textarea
              placeholder="Provide any evidence or examples that support your report..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitFlag.isPending}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
