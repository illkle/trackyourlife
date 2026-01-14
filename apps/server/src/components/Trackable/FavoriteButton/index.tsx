import { HeartIcon } from "lucide-react";
import { m } from "motion/react";

import { usePowersyncDrizzle } from "@tyl/db/client/powersync/context";
import { deleteGroup, insertGroup } from "@tyl/db/client/powersync/trackable-group";

import type { ButtonVariants } from "~/@shad/components/button";
import type { TrackableListItem } from "~/utils/useZ";
import { Button } from "~/@shad/components/button";
import { useUser } from "~/db/powersync-provider";

export const FavoriteButton = ({
  variant = "ghost",
  onlyIcon = false,
  trackable,
}: {
  variant?: ButtonVariants["variant"];
  onlyIcon?: boolean;
  trackable: TrackableListItem;
}) => {
  const db = usePowersyncDrizzle();
  const { userId } = useUser();

  const inFavs = trackable.trackableGroup.some(
    (tg) => tg.group === "favorites",
  );

  const favHandler = async () => {
    if (inFavs) {
      await deleteGroup(db, {
        user_id: userId,
        trackable_id: trackable.id,
        group: "favorites",
      });
    } else {
      await insertGroup(db, {
        user_id: userId,
        trackable_id: trackable.id,
        group: "favorites",
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
