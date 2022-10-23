import Button from "@components/_UI/Button";
import Modal from "@components/_UI/Modal";
import router from "next/router";
import { useContext, useState } from "react";
import { remove } from "src/helpers/api";
import { TrackableContext } from "./trackableContext";

const DeleteButton = () => {
  const { trackable } = useContext(TrackableContext);

  const deleteTrackable = async () => {
    await remove(trackable._id);
    router.push("/");
  };

  const [confirmOpened, setConfirmOpened] = useState(false);

  const openModal = () => {
    setConfirmOpened(true);
  };

  const closeModal = () => {
    setConfirmOpened(false);
  };

  return (
    <>
      <Button click={openModal}>Delete</Button>
      {confirmOpened && (
        <Modal close={closeModal}>
          <h2 className="text-xl">Are you sure you want to delete?</h2>
          <p className="pt-2">This action is irreversible</p>
          <div className="pt-3">
            <Button click={deleteTrackable}>Confirm</Button>
            <Button className="ml-4" click={closeModal}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default DeleteButton;
