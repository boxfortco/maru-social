import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

const stageTypes = {
  "Digital Art / Illustration": [
    "Reference/Mood Board",
    "Thumbnail Sketches",
    "Rough Concept",
    "Line Art/Sketch",
    "Base Colors",
    "Color Studies",
    "Work in Progress",
    "Detail Pass",
    "Lighting/Effects",
    "Final Adjustments",
    "Final"
  ],
  "Traditional Painting": [
    "Reference Collection",
    "Composition Sketches",
    "Value Study",
    "Color Study",
    "Underpainting",
    "Blocking In",
    "Work in Progress",
    "Detail Work",
    "Final Touches",
    "Final"
  ],
  "3D Art": [
    "Reference Gathering",
    "Concept Sketches",
    "Blockout/Base Mesh",
    "High Poly Modeling",
    "UV Mapping",
    "Texturing",
    "Rigging",
    "Materials/Shading",
    "Lighting Setup",
    "Final Renders"
  ],
  "Photography": [
    "Location/Subject Scouting",
    "Raw Shots",
    "Selection/Culling",
    "Basic Adjustments",
    "Color Grading",
    "Retouching",
    "Final Edits",
    "Final"
  ],
  "Default/Generic": [
    "Research/Reference",
    "Concept/Planning",
    "Foundation Work",
    "Rough Development",
    "Work in Progress",
    "Refinement",
    "Final Touches",
    "Final"
  ]
} as const;

type StageUploadProps = {
  projectId: number;
};

export default function StageUpload({ projectId }: StageUploadProps) {
  const [stageType, setStageType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const { addStage } = useProjects();
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!stageType) {
      toast({
        title: "Error",
        description: "Please select a stage type first",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for image upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "artwork_original");
      
      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dz9wyfepq/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadResult = await uploadResponse.json();

      // Add stage with uploaded image URL
      await addStage({
        projectId,
        data: {
          stageType,
          imageUrl: uploadResult.secure_url,
          description,
        },
      });

      toast({
        title: "Success",
        description: "Stage uploaded successfully",
      });

      // Reset form
      setStageType("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Select value={stageType} onValueChange={setStageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(stageTypes).map(([category, stages]) => (
                  <div key={category} className="space-y-1">
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {category}
                    </div>
                    {stages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Describe this stage of your work (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              disabled={!stageType || uploading}
              className="relative"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </Button>
            {uploading && <span className="text-sm">Uploading...</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
