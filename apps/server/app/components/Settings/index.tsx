import { Switch } from "~/@shad/components/switch";
import { useZ } from "~/utils/useZ";

export const PreserveLocationOnSidebarNavSwitch = () => {
  const z = useZ();

  const update = (value: boolean) => {
    // TODO: implement
  };

  return (
    <>
      <Switch checked={false} onCheckedChange={update} />
      {false ? "Enabled" : "Disabled"}
    </>
  );
};
