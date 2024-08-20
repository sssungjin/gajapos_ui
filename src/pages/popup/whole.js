import { Modal, ModalBody, ModalHeader } from "reactstrap";
import React, { useState } from "react";
import TextPopup from "./text";
import axios from "axios";
import JEPETTO_API_URL from "../../utils/JepettoApiUrl";

const WholeSalePopup = ({ isOpen, onClose, onApplyDiscount }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [list, setList] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");

  const [textPopup, toggleTextPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
  });

  const toggleModal = (result) => {
    onClose?.(result);
    setKeyword("");
    setList([]);
    setSelectedRow(null);
    setAlertMessage("");
  };

  const onSearch = async () => {
    if (!keyword) {
      setAlertMessage("Please enter a keyword to search.");
      return;
    }

    const jsonData = {
      function: "getwhole",
      item: {
        keyword: keyword,
      },
    };

    let config = {
      method: "post",
      url: JEPETTO_API_URL,
      data: jsonData,
      withCredentials: true,
    };

    try {
      const response = await axios.request(config);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setList(response.data);
        setAlertMessage("");
      } else {
        setList([]);
        setAlertMessage("No search data");
      }
    } catch (error) {
      console.error("Error fetching whole sale data:", error);
      setList([]);
      setAlertMessage("Error occurred while fetching data");
    }
  };

  const onApply = () => {
    if (selectedRow === null) {
      setAlertMessage("Please select your company.");
      return;
    }
    const selectedCompany = list[selectedRow];
    onApplyDiscount?.(
      "whole",
      selectedCompany.sd_reginumber,
      selectedCompany.sd_name
    );
    onClose?.();
    setKeyword("");
    setList([]);
    setSelectedRow(null);
    setAlertMessage("");
  };

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

  const selectRow = (index) => {
    setSelectedRow(index);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggleModal}
      style={{ minWidth: "900px" }}
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
        Whole Sale
      </ModalHeader>
      <ModalBody>
        <div className="d-flex flex-column">
          <div className="form-inline whole-sale">
            <label className="control-label form-control-lg">Whole Sale:</label>
            <input
              type="text"
              className="form-control"
              value={keyword}
              onClick={() => showTextPopup(keyword, setKeyword)}
              style={{ width: "400px" }}
            />
            <button className="btn btn-info m-l-10" onClick={onSearch}>
              Search
            </button>
          </div>
          {alertMessage && (
            <div className="form-group row mt-2">
              <div className="col-md-12 text-danger text-center">
                {alertMessage}
              </div>
            </div>
          )}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table
              className="table table-bordered whole"
              style={{ textAlign: "center" }}
            >
              <thead>
                <tr>
                  <th style={{ width: "26%" }}>Company</th>
                  <th style={{ width: "17%" }}>TIN</th>
                  <th style={{ width: "17%" }}>Telephone</th>
                  <th style={{ width: "40%" }}>Address</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(list) && list.length > 0 ? (
                  list.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor:
                          selectedRow === index ? "#e0e0e0" : "transparent",
                        cursor: "pointer",
                      }}
                      onDoubleClick={() => {
                        setSelectedRow(index);
                        onApply();
                      }}
                      onClick={() => selectRow(index)}
                    >
                      <td>{item.sd_name}</td>
                      <td>{item.sd_reginumber}</td>
                      <td>{item.sd_tel}</td>
                      <td>{item.sd_address}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-1">
            <button className="btn btn-success btn-lg" onClick={onApply}>
              Apply
            </button>
          </div>
        </div>
      </ModalBody>
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

export default WholeSalePopup;
