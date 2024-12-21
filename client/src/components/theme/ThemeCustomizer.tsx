import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Paintbrush, Check } from "lucide-react"
import { useTheme, type ThemeConfig } from "./theme-provider"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const presetThemes = [
  {
    name: "Default",
    value: "default",
    className: "bg-[oklch(70%_0.1_20)]"
  },
  {
    name: "Luxury",
    value: "luxury",
    className: "bg-[oklch(30%_0.15_25)]"
  },
  {
    name: "Modern",
    value: "modern",
    className: "bg-[oklch(50%_0.2_230)]"
  }
]

export function ThemeCustomizer() {
  const { currentTheme, setTheme, themeConfig, setCustomTheme, appearance, setAppearance } = useTheme()
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [customConfig, setCustomConfig] = useState<ThemeConfig>(themeConfig)

  const handleCustomTheme = () => {
    setCustomTheme(customConfig)
    setIsCustomizing(false)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Paintbrush className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Customize Theme</h4>
          <Separator />
          <Tabs defaultValue="preset">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preset">Preset</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="preset" className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-2">
                {presetThemes.map((theme) => (
                  <Button
                    key={theme.value}
                    variant="outline"
                    className={cn(
                      "justify-start",
                      currentTheme === theme.value && "border-2 border-primary"
                    )}
                    onClick={() => setTheme(theme.value)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("h-4 w-4 rounded", theme.className)} />
                      <span className="text-xs">{theme.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Appearance</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant="outline"
                      className={cn(
                        appearance === mode && "border-2 border-primary"
                      )}
                      onClick={() => setAppearance(mode)}
                    >
                      <span className="capitalize">{mode}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="custom" className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <input
                  type="color"
                  className="w-full h-10 rounded-md"
                  value={customConfig.primary}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, primary: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <input
                  type="color"
                  className="w-full h-10 rounded-md"
                  value={customConfig.secondary}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, secondary: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <input
                  type="color"
                  className="w-full h-10 rounded-md"
                  value={customConfig.accent}
                  onChange={(e) =>
                    setCustomConfig({ ...customConfig, accent: e.target.value })
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCustomTheme}
              >
                Save Custom Theme
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
