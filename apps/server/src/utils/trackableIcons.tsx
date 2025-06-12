import type { LucideProps } from "lucide-react";
import {
  CaseSensitiveIcon,
  ChartColumnIncreasing,
  ListIcon,
  TagsIcon,
  ToggleRight,
} from "lucide-react";

import type { DbTrackableSelect } from "@tyl/db/schema";

export const TrackableIconsMap: Record<
  DbTrackableSelect["type"],
  React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >
> = {
  boolean: ToggleRight,
  number: ChartColumnIncreasing,
  text: CaseSensitiveIcon,
  tags: TagsIcon,
  logs: ListIcon,
};

export const RenderTrackableIcon = ({
  type,
  ...props
}: {
  type: DbTrackableSelect["type"];
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) => {
  const Icon = TrackableIconsMap[type];

  return <Icon {...props} />;
};
