import { Modal, ModalBody, ModalHeader } from "reactstrap";
import React, { useState } from "react";
import TextPopup from "./text";
import axios from "axios";
import JEPETTO_API_URL from "../../utils/JepettoApiUrl";

const PreferenceLoginPopup = ({ isOpen, onClose, callback }) => {
  const [role, setRole] = useState("");
  const [id, setId] = useState("admin");
  const [password, setPassword] = useState("Qkslffk@91");
  const [alertMessage, setAlertMessage] = useState("");
  const [textPopup, toggleTextPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
  });

  const toggleModal = (result) => {
    setId("");
    setPassword("");
    setAlertMessage("");
    onClose?.(result);
  };

  const onLogin = async () => {
    if (!role) {
      setAlertMessage("Please select a role.");
      return;
    }
    if (!id || !password) {
      setAlertMessage("Please enter both ID and Password.");
      return;
    }

    const jsonData = {
      function: "login",
      account: {
        mb_id: id,
        mb_password: password,
      },
    };

    let config = {
      method: "post",
      url: JEPETTO_API_URL,
      withCredentials: true,
      data: jsonData,
    };

    try {
      const response = await axios.request(config);
      const parsedData = JSON.parse(response.data.replace(/'/g, '"'));

      if (parsedData.code === "200") {
        const isValidRole =
          (role === "admin" && parsedData.mb_level === "10") ||
          (role === "cashier" && parsedData.mb_level === "6");

        if (isValidRole) {
          const isAdmin = role === "admin";
          callback?.(isAdmin, parsedData.mb_name);
          toggleModal(false);
        } else {
          setAlertMessage(
            "The selected role does not match your access level. Please try again."
          );
        }
      } else {
        console.error("Response Data:", response.data);
        setAlertMessage("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      setAlertMessage("An error occurred while logging in. Please try again.");
    }
    onReset();
  };

  const handleRoleChange = (event) => {
    setRole(event.target.value);
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

  const onReset = () => {
    setId("");
    setPassword("");
    setRole("");
    setAlertMessage("");
  };

  return (
    <Modal
      isOpen={isOpen}
      size={"lg"}
      toggle={toggleModal}
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
        Log-In
      </ModalHeader>
      <ModalBody>
        <div className="row">
          <div className="col-xl-12 p-t-20">
            <form action="/" method="POST">
              <fieldset>
                <div className="form-group row m-b-20">
                  <label className="col-md-3 col-form-label form-control-lg">
                    ID
                  </label>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter ID"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      onClick={() => showTextPopup(id, setId)}
                    />
                  </div>
                </div>
                <div className="form-group row m-b-20">
                  <label className="col-md-3 col-form-label form-control-lg">
                    Password
                  </label>
                  <div className="col-md-7">
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onClick={() => showTextPopup(password, setPassword)}
                    />
                  </div>
                </div>
                <div className="form-group row m-b-20">
                  <div className="col-md-7 offset-md-3">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        id="cashier"
                        value="cashier"
                        checked={role === "cashier"}
                        onChange={handleRoleChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="cashier"
                        style={{ fontSize: "24px" }}
                      >
                        Cashier
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        id="admin"
                        value="admin"
                        checked={role === "admin"}
                        onChange={handleRoleChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="admin"
                        style={{ fontSize: "24px" }}
                      >
                        Admin
                      </label>
                    </div>
                  </div>
                </div>
                {alertMessage && (
                  <div className="form-group row mt-2">
                    <div className="col-md-12 text-danger text-center">
                      {alertMessage}
                    </div>
                  </div>
                )}
                <div className="form-group row">
                  <div className="col-md-7 offset-md-3 d-flex">
                    <button
                      type="reset"
                      className="btn btn-lg btn-info flex-fill m-r-5"
                      onClick={onReset}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="btn btn-lg btn-primary flex-fill m-r-5"
                      onClick={onLogin}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="btn btn-lg btn-default flex-fill"
                      onClick={toggleModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </fieldset>
            </form>
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

export default PreferenceLoginPopup;
