import { useZero } from "@rocicorp/zero/react";
import { HeartIcon } from "lucide-react";
import { m } from "motion/react";

import { mutators } from "@tyl/db/mutators";

import type { ButtonVariants } from "~/@shad/components/button";
import type { TrackableListItem } from "~/utils/useZ";
import { Button } from "~/@shad/components/button";
import { useZ } from "~/utils/useZ";

export const FavoriteButton = ({
  variant = "ghost",
  onlyIcon = false,
  trackable,
}: {
  variant?: ButtonVariants["variant"];
  onlyIcon?: boolean;
  trackable: TrackableListItem;
}) => {
  const inFavs = trackable.trackableGroup.some(
    (tg) => tg.group === "favorites",
  );

  const zero = useZero();

  const favHandler = async () => {
    if (inFavs) {
      await zero.mutate(
        mutators.trackableGroup.delete({
          trackableId: trackable.id,
          group: "favorites",
        }),
      );
    } else {
      await zero.mutate(
        mutators.trackableGroup.insert({
          trackableId: trackable.id,
          group: "favorites",
        }),
      );
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
