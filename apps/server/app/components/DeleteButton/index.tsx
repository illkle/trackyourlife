import { useMutation } from "@tanstack/react-query";
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
import { useZ } from "~/utils/useZ";

const DeleteButton = ({
  id,
  children,
}: {
  id: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  const router = useRouter();

  const z = useZ();

  const mutation = useMutation({
    mutationFn: (id: string) => z.mutate.TYL_trackable.delete({ id }),
    onSuccess: async () => {
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
            onClick={() => void mutation.mutateAsync(id)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteButton;
