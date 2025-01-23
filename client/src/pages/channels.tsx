import { Shield, Users, TrendingUp, Star, Book, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const channelCategories = [
  { id: 1, name: "Industry Professionals", icon: Shield, count: 24 },
  { id: 2, name: "Art Schools & Education", icon: Book, count: 18 },
  { id: 3, name: "Community Curated", icon: Users, count: 32 },
  { id: 4, name: "Emerging Artists", icon: Star, count: 45 }
];

export default function Channels() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-4">Curated Channels</h1>
          <p className="text-lg opacity-90 mb-6">Expert-moderated spaces showcasing the best artistic processes and techniques</p>

          {/* Channel Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {channelCategories.map(category => (
              <button key={category.id} className="bg-primary-foreground/10 rounded-lg p-4 text-left hover:bg-primary-foreground/20">
                <category.icon className="w-6 h-6 mb-2" />
                <div className="font-medium mb-1">{category.name}</div>
                <div className="text-sm opacity-75">{category.count} channels</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Featured Channels List */}
        <div className="space-y-8">
          {/* This will be populated with real data from the API */}
          <Card>
            <CardHeader className="relative">
              <div className="aspect-[3/1] rounded-t-lg overflow-hidden mb-4">
                <img 
                  src="/api/placeholder/800/300"
                  alt="Channel cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-background shadow-md">
                  <img 
                    src="/api/placeholder/60/60"
                    alt="Channel avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>Concept Art Masters</CardTitle>
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Industry professionals sharing their concept art process and techniques
                  </p>
                </div>
                <Button>Follow</Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  24.6k followers
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  12 posts/week
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Moderated by Sarah Chen, Mike Ross
                </div>
              </div>

              <h3 className="text-lg font-medium mb-4">Featured Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2].map(id => (
                  <div key={id} className="group relative">
                    <div className="aspect-4/3 rounded-lg overflow-hidden">
                      <img 
                        src="/api/placeholder/300/200"
                        alt="Featured artwork"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h4 className="font-medium mb-1 text-sm">Artwork Title</h4>
                        <p className="text-xs opacity-90">by Artist Name</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}