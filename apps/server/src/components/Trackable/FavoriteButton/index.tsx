import { HeartIcon } from "lucide-react";
import { m } from "motion/react";

import type { ButtonProps } from "~/@shad/components/button";
import type { TrackableListItem } from "~/utils/useZ";
import { Button } from "~/@shad/components/button";
import { useZ } from "~/utils/useZ";

export const FavoriteButton = ({
  variant = "ghost",
  onlyIcon = false,
  trackable,
}: {
  variant?: ButtonProps["variant"];
  onlyIcon?: boolean;
  trackable: TrackableListItem;
}) => {
  const inFavs = trackable.trackableGroup.some(
    (tg) => tg.group === "favorites",
  );

  const z = useZ();

  const favHandler = async () => {
    if (inFavs) {
      await z.mutate.TYL_trackableGroup.delete({
        trackableId: trackable.id,
        group: "favorites",
      });
    } else {
      await z.mutate.TYL_trackableGroup.insert({
        trackableId: trackable.id,
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
