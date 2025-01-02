import { useMemo } from "react";
import { m } from "framer-motion";
import { HeartIcon } from "lucide-react";

import type { ButtonProps } from "~/@shad/components/button";
import { Button } from "~/@shad/components/button";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useZ, useZeroGroupSet } from "~/utils/useZ";

export const FavoriteButton = ({
  variant = "ghost",
  onlyIcon = false,
}: {
  variant?: ButtonProps["variant"];
  onlyIcon?: boolean;
}) => {
  const { id } = useTrackableMeta();

  const z = useZ();

  const favsSet = useZeroGroupSet("favorites");

  const inFavs = id ? favsSet.has(id) : false;

  const favHandler = async () => {
    if (inFavs) {
      z.mutate.TYL_trackableGroup.delete({
        trackableId: id,
        group: "favorites",
      });
    } else {
      z.mutate.TYL_trackableGroup.insert({
        trackableId: id,
        group: "favorites",
        user_id: z.userID,
      });
    }
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
