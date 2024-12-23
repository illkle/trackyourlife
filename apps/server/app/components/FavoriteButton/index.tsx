import { useMemo } from "react";
import { m } from "framer-motion";
import { HeartIcon } from "lucide-react";

import type { ButtonProps } from "~/@shad/components/button";
import { Button } from "~/@shad/components/button";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useSessionAuthed } from "~/utils/useSessionInfo";
import { useZ } from "~/utils/useZ";

export const FavoriteButton = ({
  variant = "ghost",
  onlyIcon = false,
}: {
  variant?: ButtonProps["variant"];
  onlyIcon?: boolean;
}) => {
  const { id } = useTrackableMeta();

  const { sessionInfo } = useSessionAuthed();

  const z = useZ();

  const settingsSet = useMemo(() => {
    return new Set<string>([]);
  }, []);

  const inFavs = id ? settingsSet.has(id) : false;

  const favHandler = async () => {
    // TODO: implement
  };

  return (
    <Button asChild variant={variant} onClick={() => void favHandler()}>
      <m.button layout transition={{ ease: "circOut" }}>
        {inFavs ? (
          <>
            <HeartIcon className="iconFill" fill="currentColor" size={16} />
            {!onlyIcon && <span className="max-md:hidden">Unfavorite</span>}
          </>
        ) : (
          <>
            <HeartIcon size={16} />
            {!onlyIcon && <span className="max-md:hidden">Favorite</span>}
          </>
        )}
      </m.button>
    </Button>
  );
};
