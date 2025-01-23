import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, X } from "lucide-react";
import { artCategories, stageTypes, type Stage } from "@db/schema";
import uploadImage from "@/utils/cloudinary";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(artCategories, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  stages: z.array(z.object({
    stageType: z.enum(stageTypes),
    imageUrl: z.string().url(),
    description: z.string().optional()
  })).min(1, "At least one stage is required")
});

type FormData = z.infer<typeof formSchema>;

export default function ProjectCreator() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { createProject } = useProjects();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      stages: []
    }
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const currentStages = form.getValues('stages') || [];

      for (const file of files) {
        const uploadResult = await uploadImage(file);
        currentStages.push({
          stageType: "work in progress" as const,
          imageUrl: uploadResult.secure_url,
          description: ""
        });
      }

      form.setValue('stages', currentStages, { shouldValidate: true });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createProject(data);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeStage = (index: number) => {
    const currentStages = form.getValues('stages');
    currentStages.splice(index, 1);
    form.setValue('stages', currentStages, { shouldValidate: true });
  };

  const updateStageType = (index: number, stageType: typeof stageTypes[number]) => {
    const stages = form.getValues('stages');
    stages[index].stageType = stageType;
    form.setValue('stages', stages, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {artCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Stages</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {form.watch('stages')?.map((stage, index) => (
                  <div key={index} className="relative">
                    <img
                      src={stage.imageUrl}
                      alt={`Stage ${index + 1}`}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeStage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Select
                      value={stage.stageType}
                      onValueChange={(value) => updateStageType(index, value as typeof stageTypes[number])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stageTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Add Images"}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <Button type="submit" disabled={uploading}>
              Create Project
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}