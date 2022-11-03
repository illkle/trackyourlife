import { ITrackable } from "@t/trackable";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getSingle } from "src/helpers/api";
import TrackableProvider from "src/helpers/trackableContext";
import { trpc } from "src/utils/trpc";
import MiniTrackable from "./miniTrackable";

const Trackable = ({ id }: { id: ITrackable["_id"] }) => {
  const { data } = trpc.trackable.getTrackableById.useQuery(id);

  if (!data) return <div>loading</div>;

  return (
    <TrackableProvider trackable={data}>
      <article className="border-b border-zinc-200 py-2 last:border-0">
        <Link href={`/trackable/${id}`}>
          <h3 className="w-fit cursor-pointer text-xl ">
            {data.settings.name}
          </h3>
        </Link>
        <MiniTrackable className="my-4" />
      </article>
    </TrackableProvider>
  );
};

const TrackablesList = ({ list }: { list: ITrackable["_id"][] }) => {
  if (!list) return <div>no list</div>;

  return (
    <div className="grid gap-5">
      {list.map((id) => (
        <Trackable id={id} key={id} />
      ))}
    </div>
  );
};

export default TrackablesList;