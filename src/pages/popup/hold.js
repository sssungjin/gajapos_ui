import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const HoldPopup = ({ isOpen, onClose, holdItems, onApply }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const truncateName = (name, length = 68) => {
    if (name.length > length) {
      return name.slice(0, length) + "..";
    }
    return name;
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      style={{ maxWidth: "800px" }}
      fade={false}
      centered
    >
      <ModalHeader toggle={onClose}>Hold Items</ModalHeader>
      <ModalBody>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table
            className="table table-bordered"
            style={{ textAlign: "center" }}
          >
            <thead>
              <tr>
                <th style={{ width: "10%" }}>No</th>
                <th style={{ width: "75%" }}>Items</th>
                <th style={{ width: "15%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {holdItems.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedItem(item)}
                  onDoubleClick={() => onApply(item)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedItem === item ? "#e0e0e0" : "transparent",
                  }}
                >
                  <td>{index + 1}</td>
                  <td style={{ textAlign: "left", paddingLeft: "6px" }}>
                    {truncateName(
                      item.items.map((i) => i.it_en_name).join(", ")
                    )}
                  </td>
                  <td style={{ textAlign: "right", paddingRight: "6px" }}>
                    {item.total.currencyFormat()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-3">
          <button
            className="btn btn-primary"
            onClick={() => onApply(selectedItem)}
            disabled={!selectedItem}
          >
            Apply
          </button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default HoldPopup;
