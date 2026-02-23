import { createFileRoute } from '@tanstack/react-router';
import { useLiveQuery } from '@tanstack/react-db';
import { usePowersyncDrizzle } from '@tyl/helpers/data/context';
import { Button } from '~/@shad/components/button';
import { useMemo, useRef } from 'react';
import { useTrackableData } from '@tyl/helpers/data/dbHooksTanstack';
import { sub } from 'date-fns';

export const Route = createFileRoute('/app/testing')({
  component: RouteComponent,
});

function RouteComponent() {
  const d = new Date();

  const last = useMemo(() => sub(d, { months: 2 }), [d]);

  const q = useTrackableData({
    fromArchive: false,
    firstDay: last,
    lastDay: d,
  });

  return <div className="mx-auto max-w-md">{JSON.stringify(q.data)}</div>;
}
