import { HeartIcon } from "lucide-react";
import { m } from "motion/react";

import { buttonVariants } from "~/@shad/components/button";
import { Button } from "~/@shad/components/button";
import { VariantProps } from "class-variance-authority";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { useIsTrackableInGroup } from "@tyl/helpers/data/dbHooksTanstack";

export const FavoriteButton = ({
  variant = "ghost",
  onlyIcon = false,
}: {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  onlyIcon?: boolean;
}) => {
  const { id } = useTrackableMeta();

  const { data: inFavs, toggleGroup } = useIsTrackableInGroup(id, "favorites");

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
      onClick={() => void toggleGroup()}
    ></Button>
  );
};
