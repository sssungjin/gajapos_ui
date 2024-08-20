import { Modal, ModalBody, ModalHeader } from "reactstrap";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useState, useEffect, useCallback } from "react";

const TextPopup = ({ isOpen, data, onClose, onApply }) => {
  const [value, setValue] = useState(data);
  const [keyboard, setKeyboard] = useState(null);
  const [capsLock, setCapsLock] = useState(false);
  const [shiftState, setShiftState] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue(data);
    }
  }, [isOpen, data]);

  const toggleModal = (result) => onClose?.(result);
  const onConfirm = useCallback(() => {
    onApply?.(value);
    toggleModal();
  }, [onApply, value, toggleModal]);

  // 실제 키보드 Enter 키 이벤트 처리
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onConfirm();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        handleBackspace();
      } else if (event.key.length === 1) {
        event.preventDefault();
        if (capsLock || shiftState) {
          setValue((prevValue) => prevValue + event.key.toUpperCase());
        } else {
          setValue((prevValue) => prevValue + event.key);
        }
      }
    },
    [onConfirm, toggleModal, capsLock, shiftState]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleShift = () => {
    if (!keyboard) return;

    setShiftState(true);

    const currentLayout = keyboard.options.layoutName;
    const shiftToggle = currentLayout === "default" ? "shift" : "default";
    keyboard.setOptions({
      layoutName: shiftToggle,
    });
  };

  const onKeyPress = (button) => {
    if (button === "{shift}") {
      handleShift();
      return;
    } else if (button === "{lock}") {
      setCapsLock(!capsLock);
      return;
    } else if (button === "{enter}") {
      onConfirm();
      setShiftState(false);
      return;
    } else if (button === "{esc}") {
      toggleModal();
      setShiftState(false);
      setCapsLock(false);
      return;
    } else if (button === "{bksp}") {
      handleBackspace();
      return;
    } else if (button === "{tab}") {
      handleTab();
      return;
    }

    // 알파벳 입력 시 대문자로 변환
    if (/^[a-zA-Z]$/.test(button)) {
      setValue(value + button.toUpperCase());
    } else {
      setValue(value + button);
    }
  };

  const handleBackspace = () => {
    setValue(value.slice(0, -1));
  };

  const handleTab = () => {
    setValue(value + "\t");
  };

  return (
    <Modal isOpen={isOpen} toggle={toggleModal} fade={false} centered>
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
        Text Input
      </ModalHeader>
      <ModalBody>
        <div className="text-input">
          <input
            type="text"
            className="form-control form-control-lg"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Keyboard
            keyboardRef={(r) => setKeyboard(r)}
            onKeyPress={onKeyPress}
            layoutName="default"
            maxWidth={1000}
          />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default TextPopup;
