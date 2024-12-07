import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/@shad/components/alert-dialog";
import { invalidateTrackablesList } from "~/query/trackablesList";
import { trpc } from "~/trpc/react";

const DeleteButton = ({
  id,
  children,
}: {
  id: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  const router = useRouter();

  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: trpc.trackablesRouter.deleteTrackable.mutate,
    onSuccess: async () => {
      await invalidateTrackablesList(qc);
      await router.navigate({ to: "/app/trackables" });
    },
  });

  return (
    <AlertDialog>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            trackale.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            name="confirm delete"
            onClick={() => void mutation.mutateAsync({ id })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;
