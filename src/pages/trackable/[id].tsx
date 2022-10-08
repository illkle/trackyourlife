import { useRouter } from "next/router";
import Page from "@components/Page";
import TrackableView from "@components/TrackableView";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { getSingle } from "src/helpers/api";
import { IdContext } from "src/helpers/idContext";

const Trackable = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useQuery(["trackable", id], () => getSingle(id as string));

  return (
    <Page title={data.settings.name}>
      <IdContext.Provider value={id as string}>
        <TrackableView trackable={data} />
      </IdContext.Provider>
    </Page>
  );
};

export default Trackable;

export async function getServerSideProps(context) {
  const { id } = context.query;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["trackable", id], () => getSingle(id));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
