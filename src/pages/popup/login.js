import React, { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import axios from "axios";
import TextPopup from "./text";
import { useBalance } from "../../contexts/BalanceContext";
import JEPETTO_API_URL from "../../utils/JepettoApiUrl";

const LoginPopup = ({ isOpen, onClose, callback, lastLoginTime }) => {
  const [id, setId] = useState("admin");
  const [password, setPassword] = useState("Qkslffk@91");
  const [textPopup, toggleTextPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
  });
  const [alertMessage, setAlertMessage] = useState("");
  const { resetBalance } = useBalance();

  const toggleModal = (result) => {
    setId("");
    setPassword("");
    onClose?.(result);
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

  // const onLogin = async () => {
  //   if (!id || !password) {
  //     setAlertMessage("Please enter both ID and Password.");
  //     return;
  //   }

  //   const jsonData = {
  //     function: "login",
  //     account: {
  //       mb_id: id,
  //       mb_password: password,
  //     },
  //   };

  //   let config = {
  //     method: "post",
  //     url: JEPETTO_API_URL,
  //     withCredentials: true,
  //     data: jsonData,
  //   };

  //   try {
  //     const response = await axios.request(config);
  //     const parsedData = response.data;
  //     if (parsedData.code === "200") {
  //       callback?.(
  //         parsedData.mb_last_login,
  //         parsedData.mb_name,
  //         parsedData.mb_id,
  //         parsedData.mb_level,
  //         parsedData.token
  //       );
  //       toggleModal(false);
  //       setId("");
  //       setPassword("");
  //       resetBalance();
  //     } else {
  //       console.error("Response Data:", response.data);
  //       alert("ID or Password is wrong. Please try again.");
  //     }
  //     resetBalance();
  //   } catch (error) {
  //     console.error("Error logging in: ", error);
  //     alert("An error occurred while logging in. Please try again.");
  //   }
  // };

  const onLogin = async () => {
    if (!id || !password) {
      setAlertMessage("Please enter both ID and Password.");
      return;
    }

    // 항상 로그인 성공으로 처리
    const mockResponse = {
      mb_last_login: new Date().toISOString(),
      mb_name: "Test User",
      mb_id: id,
      mb_level: "admin",
      token: "mock-token-12345",
    };

    callback?.(
      mockResponse.mb_last_login,
      mockResponse.mb_name,
      mockResponse.mb_id,
      mockResponse.mb_level,
      mockResponse.token
    );
    toggleModal(false);
    setId("");
    setPassword("");
    resetBalance();
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
            <form>
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
                {alertMessage && (
                  <div className="form-group row m-b-20">
                    <div className="col-md-7 offset-md-3 text-danger">
                      {alertMessage}
                    </div>
                  </div>
                )}
                <div className="form-group row">
                  <div className="col-md-7 offset-md-3 d-flex">
                    <button
                      type="reset"
                      className="btn btn-lg btn-info flex-fill m-r-5"
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
                {lastLoginTime && (
                  <div className="form-group row m-b-20">
                    <div
                      className="col-md-7 offset-md-3"
                      style={{ fontSize: "16px" }}
                    >
                      Your last logout time: {lastLoginTime}
                    </div>
                  </div>
                )}
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

export default LoginPopup;
