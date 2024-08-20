import React, { useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ProductNotFoundPopup = ({ isOpen, onClose, barcode }) => {
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
    <Modal isOpen={isOpen} toggle={onClose} fade={false} centered>
      <ModalHeader toggle={onClose}>Product Not Found</ModalHeader>
      <ModalBody>
        <h2 style={{ textAlign: "center" }}>Item not found</h2>
        <p style={{ textAlign: "center", fontSize: "1.2rem" }}>
          Barcode: {barcode}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProductNotFoundPopup;
