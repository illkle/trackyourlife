import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsClient } from "usehooks-ts";

import { RadioTabItem, RadioTabs } from "~/@shad/components/radio-tabs";
import { cn } from "~/@shad/utils";

export const ThemeSwitcher = ({ className }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  return (
    <RadioTabs
      value={isClient ? theme : undefined}
      onValueChange={setTheme}
      className={cn("h-8 w-fit p-0.5", className)}
    >
      <RadioTabItem value="light" id="light" className="w-full">
        <SunIcon size={16} />
      </RadioTabItem>
      <RadioTabItem value="system" id="system" className="w-full">
        <LaptopIcon size={16} />
      </RadioTabItem>
      <RadioTabItem value="dark" id="dark" className="w-full">
        <MoonIcon size={16} />
      </RadioTabItem>
    </RadioTabs>
  );
};
