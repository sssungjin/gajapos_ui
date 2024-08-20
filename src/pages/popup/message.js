import React, { useEffect } from "react";
import { Modal, ModalBody, Button } from "reactstrap";

const MessagePopup = ({ isOpen, onClose, message }) => {
  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => {
        onClose();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      fade={false}
      size="lg"
      centered
      style={{ width: "600px" }}
    >
      <ModalBody>
        <h4
          style={{
            textAlign: "center",
            height: "auto",
          }}
        >
          {message}
        </h4>
      </ModalBody>
      <div className="text-center pb-3">
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default MessagePopup;
