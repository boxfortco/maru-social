import { useEffect, useState } from 'react';
import { extractColors } from '@/utils/color-extractor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stage } from '@/types/common';
import { useLocation } from 'wouter';

interface ColorPaletteProps {
  stages: Stage[];
}

export default function ColorPalette({ stages }: ColorPaletteProps) {
  const [palettes, setPalettes] = useState<{ stage: Stage; colors: string[] }[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function extractPalettes() {
      const extractedPalettes = await Promise.all(
        stages.map(async (stage) => ({
          stage,
          colors: await extractColors(stage.imageUrl)
        }))
      );
      setPalettes(extractedPalettes);
    }

    extractPalettes();
  }, [stages]);

  const handleColorClick = (color: string) => {
    setLocation(`/discover?color=${encodeURIComponent(color.substring(1))}`);
  };

  if (palettes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Palettes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {palettes.map(({ stage, colors }, index) => (
          <div key={stage.id} className="space-y-2">
            <div className="text-sm font-medium">{stage.stageType}</div>
            <div className="flex h-12 rounded-lg overflow-hidden">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex-1 relative group cursor-pointer hover:z-10"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorClick(color)}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                    <span className="text-white text-xs font-mono uppercase">
                      {color}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}