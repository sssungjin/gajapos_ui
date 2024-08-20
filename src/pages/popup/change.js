import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ChangePopup = ({ isOpen, onClose, changeAmount }) => {
  const [displayMessage, setDisplayMessage] = useState("");

  useEffect(() => {
    let timer;
    if (isOpen) {
      setDisplayMessage(
        changeAmount >= 0
          ? `${changeAmount.currencyFormat()}`
          : `Pay ${(-changeAmount).currencyFormat()} more`
      );

      timer = setTimeout(() => {
        onClose();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, onClose, changeAmount]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} fade={false} centered>
      <ModalHeader toggle={onClose}>Change Amount</ModalHeader>
      <ModalBody>
        <h1 style={{ fontSize: "3rem", textAlign: "center" }}>
          {displayMessage}
        </h1>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ChangePopup;
