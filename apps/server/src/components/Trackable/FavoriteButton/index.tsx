import { HeartIcon } from "lucide-react";
import { m } from "motion/react";

import { buttonVariants } from "~/@shad/components/button";
import { Button } from "~/@shad/components/button";
import { useGroupHandlers } from "@tyl/helpers/data/dbHooks";
import { VariantProps } from "class-variance-authority";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useIsTrackableInGroup } from "@tyl/helpers/data/TrackableGroupsProvider";

export const FavoriteButton = ({
  variant = "ghost",
  onlyIcon = false,
}: {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  onlyIcon?: boolean;
}) => {
  const { id } = useTrackableMeta();
  const { removeFromGroup, addToGroup } = useGroupHandlers();

  const inFavs = useIsTrackableInGroup(id, "favorites");

  const favHandler = async () => {
    if (inFavs) {
      await removeFromGroup({
        trackableId: id,
        group: "favorites",
      });
    } else {
      await addToGroup({
        trackableId: id,
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
