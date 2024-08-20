import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useEffect, useState, useCallback } from "react";

const NumberPopup = ({
  isOpen,
  data,
  onClose,
  onApply,
  maxDigits = 32,
  isCardNumber = false,
}) => {
  const [value, setValue] = useState(isCardNumber ? "" : "0");

  useEffect(() => {
    if (isOpen) {
      setValue(data);
    }
  }, [isOpen, data]);
  const toggleModal = useCallback(() => {
    // 팝업이 닫힐 때 값을 초기화
    setValue(isCardNumber ? "" : "0");
    onClose?.();
  }, [onClose, isCardNumber]);

  const onClear = () => setValue(isCardNumber ? "" : "0");

  const onConfirm = useCallback(() => {
    onApply?.(value);
    toggleModal();
  }, [onApply, value, toggleModal]);

  const handleKeyDown = useCallback(
    (event) => {
      event.stopPropagation();
      if (event.key === "Enter") {
        event.preventDefault();
        onConfirm();
      } else if (/^[0-9.]$/.test(event.key)) {
        event.preventDefault();
        onNumberPad(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        onDelete();
      }
    },
    [onConfirm, toggleModal]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const onNumberPad = (digit) => {
    if (value.length >= maxDigits) {
      return;
    }
    if (digit === "." && value.includes(".")) {
      return;
    }
    if (isNaN(Number(`${value}${digit}`))) {
      return;
    }
    setValue((prev) =>
      (prev === "0" || prev === 0) && !isCardNumber && digit !== "."
        ? `${digit}`
        : `${prev}${digit}`
    );
  };

  const onDelete = () => {
    if (value.length === 1 || (value.length === 0 && isCardNumber)) {
      setValue(isCardNumber ? "" : "0");
      return;
    }
    setValue((prev) => prev.slice(0, -1));
  };

  const onDot = () => {
    if (isNaN(Number(`${value}.`))) {
      return;
    }
    setValue((prev) => `${prev}.`);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggleModal}
      style={{ width: 400 }}
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
        Number
      </ModalHeader>
      <ModalBody>
        <div className="number-input">
          <div className="form-control form-control-lg number-display">
            {isCardNumber ? value : value.currencyFormat()}
          </div>
          <div className="number-pad">
            <div className="number-button" onClick={() => onNumberPad(7)}>
              <label>7</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(8)}>
              <label>8</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(9)}>
              <label>9</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(4)}>
              <label>4</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(5)}>
              <label>5</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(6)}>
              <label>6</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(1)}>
              <label>1</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(2)}>
              <label>2</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(3)}>
              <label>3</label>
            </div>
            <div className="number-button" onClick={onDelete}>
              <label>DEL</label>
            </div>
            <div className="number-button" onClick={() => onNumberPad(0)}>
              <label>0</label>
            </div>
            <div className="number-button" onClick={onDot}>
              <label>.</label>
            </div>
          </div>
          <div className="btn-group">
            <button className="btn btn-lg btn-default" onClick={onClear}>
              Clear
            </button>
            <button className="btn btn-lg btn-primary" onClick={onConfirm}>
              Apply
            </button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default NumberPopup;
