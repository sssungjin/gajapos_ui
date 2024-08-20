import { Modal, ModalBody, ModalHeader } from "reactstrap";
import React, { useState } from "react";
import NumberPopup from "./number";
import TextPopup from "./text";

const SeniorDiscountPopup = ({ isOpen, onClose, onApplyDiscount }) => {
  const [seniorNo, setSeniorNo] = useState("");
  const [seniorName, setSeniorName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [numberPopup, toggleNumberPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
    maxDigits: 7,
    isCardNumber: false,
  });
  const [textPopup, toggleTextPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
  });

  const toggleModal = (result) => {
    setSeniorName("");
    setSeniorNo("");
    setAlertMessage("");
    onClose?.(result);
  };

  const showNumberPopup = (data, setter, isCardNumber) =>
    toggleNumberPopup({
      isOpen: true,
      data,
      setter,
      maxDigits: 7,
      isCardNumber,
    });

  const hideNumberPopup = () =>
    toggleNumberPopup({
      isOpen: false,
      data: "",
      setter: null,
      maxDigits: 7,
      isCardNumber: false,
    });

  const showTextPopup = (data, setter) =>
    toggleTextPopup({
      isOpen: true,
      data,
      setter,
    });

  const hideTextPopup = () =>
    toggleTextPopup({
      isOpen: false,
      data: "",
      setter: null,
    });

  const onApply = () => {
    if (!seniorNo || !seniorName) {
      setAlertMessage("Please enter both Senior No and Senior Name.");
      return;
    }
    onApplyDiscount?.("senior", seniorNo, seniorName);
    toggleModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggleModal}
      style={{ width: 500 }}
      fade={false}
      centered
    >
      <ModalHeader
        className="popup-title"
        toggle={toggleModal}
        close={
          <button type="button" className="close" onClick={toggleModal}>
            <span aria-hidden="true" style={{ fontSize: "24px" }}>
              &times;
            </span>
          </button>
        }
      >
        Senior / PWD Discount
      </ModalHeader>
      <ModalBody>
        <div className="d-flex flex-column">
          <div className="form-inline">
            <label className="control-label form-control-lg width-150 justify-content-end">
              Senior No:
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter Senior No"
              style={{ width: "270px" }}
              value={seniorNo}
              onClick={() => showNumberPopup(seniorNo, setSeniorNo, 6, true)}
            />
          </div>
          <div className="form-inline m-t-15">
            <label className="control-label form-control-lg width-150 text-nowrap justify-content-end">
              Senior Name:
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter Senior Name"
              style={{ width: "270px" }}
              value={seniorName}
              onClick={() => showTextPopup(seniorName, setSeniorName)}
            />
          </div>
          {alertMessage && (
            <div className="form-group row m-t-15">
              <div className="col-md-12 text-danger text-center">
                {alertMessage}
              </div>
            </div>
          )}
          <div className="text-center mt-3">
            <button className="btn btn-success btn-lg" onClick={onApply}>
              Apply
            </button>
          </div>
        </div>
      </ModalBody>
      <NumberPopup
        isOpen={numberPopup.isOpen}
        data={numberPopup.data}
        onClose={() => hideNumberPopup()}
        onApply={(value) => {
          numberPopup.setter?.(value);
          hideNumberPopup();
        }}
        maxDigits={numberPopup.maxDigits}
        isCardNumber={numberPopup.isCardNumber}
      />
      <TextPopup
        isOpen={textPopup.isOpen}
        data={textPopup.data}
        onClose={() => hideTextPopup()}
        onApply={(value) => {
          textPopup.setter?.(value);
          hideTextPopup();
        }}
      />
    </Modal>
  );
};

export default SeniorDiscountPopup;
