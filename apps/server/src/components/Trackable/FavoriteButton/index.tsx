import { HeartIcon } from "lucide-react";
import { m } from "motion/react";

import {
  DbTrackableGroupSelect,
  DbTrackableSelect,
} from "@tyl/db/client/schema-powersync";

import { buttonVariants } from "~/@shad/components/button";
import { Button } from "~/@shad/components/button";
import { useGroupHandlers } from "@tyl/helpers/dbHooks";
import { VariantProps } from "class-variance-authority";

export const FavoriteButton = ({
  variant = "ghost",
  onlyIcon = false,
  trackable,
}: {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  onlyIcon?: boolean;
  trackable: DbTrackableSelect & { groups: DbTrackableGroupSelect[] };
}) => {
  const { removeFromGroup, addToGroup } = useGroupHandlers();

  const inFavs = trackable.groups.some((tg) => tg.group === "favorites");

  const favHandler = async () => {
    if (inFavs) {
      await removeFromGroup({
        trackableId: trackable.id,
        group: "favorites",
      });
    } else {
      await addToGroup({
        trackableId: trackable.id,
        group: "favorites",
      });
    }
  };


  return (
    <Button
      render={
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
      }
      variant={variant}
      onClick={() => void favHandler()}
    ></Button>
  );
};
