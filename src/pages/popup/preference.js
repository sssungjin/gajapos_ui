import {
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { useState, useEffect, useCallback } from "react";
import DateTime from "react-datetime";
import NumberPopup from "./number";
import TextPopup from "./text";
import "react-datetime/css/react-datetime.css";
import MessagePopup from "./message";

const PreferencePopup = ({ isOpen, onClose, isAdmin, isLoggedIn }) => {
  const [originalPreferences, setOriginalPreferences] = useState({});
  const [preferences, setPreferences] = useState({});
  const [preferencesFetched, setPreferencesFetched] = useState(false);
  const [message, setMessage] = useState({ isOpen: false, message: "" });

  const [numberPopup, toggleNumberPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
    maxDigits: 16,
    isCardNumber: false,
  });

  const [textPopup, toggleTextPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
  });

  const [activeTab, setActiveTab] = useState("1");

  const fetchPreferences = useCallback(async () => {
    if (preferencesFetched) return; // 이미 데이터를 가져왔다면 함수 실행을 중단

    try {
      const response = await fetch("preferences.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const json = await response.json();
      setPreferences(json);
      setOriginalPreferences(json);
      setPreferencesFetched(true); // 데이터를 성공적으로 가져왔음을 표시
      return json;
    } catch (error) {
      console.error("Error loading preferences:", error);
      throw error;
    }
  }, [preferencesFetched]);

  useEffect(() => {
    if (isLoggedIn && !preferencesFetched) {
      fetchPreferences().catch((error) => {
        console.error("Failed to fetch preferences:", error);
      });
    }
  }, [isLoggedIn, fetchPreferences, preferencesFetched]);

  const savePreferences = () => {
    fetch("preferences.json", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(preferences),
    })
      .then(() => {
        onClose?.();
      })
      .catch((error) => console.error("Error saving preferences:", error));
  };

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const canEdit = isAdmin;

  const showNumberPopup = (data, setter, isCardNumber) => {
    if (canEdit) {
      toggleNumberPopup({
        isOpen: true,
        data,
        setter,
        isCardNumber,
      });
    }
  };

  const hideNumberPopup = () => {
    toggleNumberPopup({
      isOpen: false,
      data: "",
      setter: null,
      isCardNumber: false,
    });
  };

  const showTextPopup = (data, setter) => {
    if (canEdit) {
      toggleTextPopup({
        isOpen: true,
        data,
        setter,
      });
    }
  };

  const hideTextPopup = () => {
    toggleTextPopup({
      isOpen: false,
      data: "",
      setter: null,
    });
  };

  const toggleModal = (result) => {
    onClose?.(result);
  };

  const handleDeleteLogDir = () => {
    if (!canEdit) {
      setMessage({
        isOpen: true,
        message: "You don't have permission to delete log directory.",
      });
      return;
    } else {
      const result = window.confirm(
        "Are you sure you want to delete log directory? Data will be lost."
      );
      if (result) {
        console.log("Delete log directory");
      }
    }
  };

  const onSave = () => {
    savePreferences();
  };

  const onCancel = () => {
    setPreferences({ ...originalPreferences });
    onClose?.();
  };

  const RenderDateTimeOrInput = ({ canEdit, value, setValue, label }) => {
    return canEdit ? (
      <div className="col-md-4">
        <DateTime
          dateFormat="YYYY-MM-DD"
          timeFormat={false}
          value={value}
          closeOnSelect={true}
          onChange={(date) => setValue(date.format("YYYY-MM-DD"))}
          inputProps={{
            className: "form-control form-control-lg",
          }}
        />
      </div>
    ) : (
      <div className="col-md-4">
        <input
          type="text"
          className="form-control form-control-lg"
          value={value}
          readOnly
          placeholder={label}
        />
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      size="xl"
      toggle={toggleModal}
      style={{ maxWidth: "1000px" }}
      fade={false}
      className="preferences-popup"
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
        Preferences
      </ModalHeader>
      <ModalBody className="preferences-body">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={activeTab === "1" ? "active" : ""}
              onClick={() => {
                toggle("1");
              }}
              style={{ fontSize: "1.2rem" }}
            >
              Company
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === "2" ? "active" : ""}
              onClick={() => {
                toggle("2");
              }}
              style={{ fontSize: "1.2rem" }}
            >
              Settings
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === "3" ? "active" : ""}
              onClick={() => {
                toggle("3");
              }}
              style={{ fontSize: "1.2rem" }}
            >
              Payment Limit
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === "4" ? "active" : ""}
              onClick={() => {
                toggle("4");
              }}
              style={{ fontSize: "1.2rem" }}
            >
              Count
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <div className="row">
              <div
                className="col-12"
                style={{
                  border: "1px solid #ccc",
                  padding: "1rem",
                }}
              >
                <h3>Company</h3>
                <div className="form-group row m-b-15">
                  <label className="col-md-2 col-form-label form-control-lg">
                    Company:
                  </label>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.company}
                      readOnly={!canEdit}
                      onClick={() =>
                        showTextPopup(preferences.company, (value) =>
                          setPreferences({ ...preferences, company: value })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-2 col-form-label form-control-lg">
                    Address1:
                  </label>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.address1}
                      readOnly={!canEdit}
                      onClick={() =>
                        showTextPopup(preferences.address1, (value) =>
                          setPreferences({ ...preferences, address1: value })
                        )
                      }
                    />
                  </div>
                  <label className="col-md-2 col-form-label form-control-lg">
                    Address2:
                  </label>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.address2}
                      readOnly={!canEdit}
                      onClick={() =>
                        showTextPopup(preferences.address2, (value) =>
                          setPreferences({ ...preferences, address2: value })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-2 col-form-label form-control-lg">
                    REG VAT TIN:
                  </label>
                  <div className="col-md-10 d-flex">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.regVat1}
                      readOnly={!canEdit}
                      style={{ width: "20%" }}
                      onClick={() =>
                        showNumberPopup(
                          preferences.regVat1,
                          (value) =>
                            setPreferences({ ...preferences, regVat1: value }),
                          true
                        )
                      }
                    />
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.regVat2}
                      readOnly={!canEdit}
                      style={{ width: "20%", marginLeft: "5px" }}
                      onClick={() =>
                        showNumberPopup(
                          preferences.regVat2,
                          (value) =>
                            setPreferences({ ...preferences, regVat2: value }),
                          true
                        )
                      }
                    />
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.regVat3}
                      readOnly={!canEdit}
                      style={{ width: "20%", marginLeft: "5px" }}
                      onClick={() =>
                        showNumberPopup(
                          preferences.regVat3,
                          (value) =>
                            setPreferences({ ...preferences, regVat3: value }),
                          true
                        )
                      }
                    />
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.regVat4}
                      readOnly={!canEdit}
                      style={{ width: "20%", marginLeft: "5px" }}
                      onClick={() =>
                        showNumberPopup(
                          preferences.regVat4,
                          (value) =>
                            setPreferences({ ...preferences, regVat4: value }),
                          true
                        )
                      }
                    />
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.regVat5}
                      readOnly={!canEdit}
                      style={{ width: "20%", marginLeft: "5px" }}
                      onClick={() =>
                        showNumberPopup(
                          preferences.regVat5,
                          (value) =>
                            setPreferences({ ...preferences, regVat5: value }),
                          true
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-2 col-form-label form-control-lg">
                    S/N:
                  </label>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.sn}
                      readOnly={!canEdit}
                      onClick={() =>
                        showTextPopup(preferences.sn, (value) =>
                          setPreferences({ ...preferences, sn: value })
                        )
                      }
                    />
                  </div>
                  <label className="col-md-2 col-form-label form-control-lg">
                    PTU:
                  </label>
                  <RenderDateTimeOrInput
                    canEdit={canEdit}
                    value={preferences.ptu}
                    setValue={(value) =>
                      setPreferences({ ...preferences, ptu: value })
                    }
                    label="PTU"
                  />
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-2 col-form-label form-control-lg">
                    M/1:
                  </label>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.mi}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.mi, (value) =>
                          setPreferences({ ...preferences, mi: value })
                        )
                      }
                    />
                  </div>
                  <label className="col-md-2 col-form-label form-control-lg">
                    TEL:
                  </label>
                  <RenderDateTimeOrInput
                    canEdit={canEdit}
                    value={preferences.tel}
                    setValue={(value) =>
                      setPreferences({ ...preferences, tel: value })
                    }
                    label="TEL"
                  />
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-2 col-form-label form-control-lg">
                    Permit:
                  </label>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.permit}
                      readOnly={!canEdit}
                      onClick={() =>
                        showTextPopup(preferences.permit, (value) =>
                          setPreferences({ ...preferences, permit: value })
                        )
                      }
                    />
                  </div>
                  <label className="col-md-2 col-form-label form-control-lg">
                    CELL:
                  </label>
                  <RenderDateTimeOrInput
                    canEdit={canEdit}
                    value={preferences.cell}
                    setValue={(value) =>
                      setPreferences({ ...preferences, cell: value })
                    }
                    label="CELL"
                  />
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane tabId="2">
            <div className="row">
              <div
                className="col-md-12 pr-2"
                style={{
                  border: "1px solid #ccc",
                  padding: "1rem",
                }}
              >
                <h3>Settings</h3>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    SerialNum:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.serialNum}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(
                          preferences.serialNum,
                          (value) =>
                            setPreferences({
                              ...preferences,
                              serialNum: value,
                            }),
                          true
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    Server IP:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.serverIp}
                      readOnly={!canEdit}
                      onClick={() =>
                        showTextPopup(preferences.serverIp, (value) =>
                          setPreferences({ ...preferences, serverIp: value })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    IP:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.ip}
                      readOnly={!canEdit}
                      onClick={() =>
                        showTextPopup(preferences.ip, (value) =>
                          setPreferences({ ...preferences, ip: value })
                        )
                      }
                    />
                  </div>
                </div>

                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    Log Dir:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.logDir}
                      readOnly={!canEdit}
                      onClick={() =>
                        showTextPopup(preferences.logDir, (value) =>
                          setPreferences({ ...preferences, logDir: value })
                        )
                      }
                    />
                    <button
                      className="btn btn-danger mt-3"
                      onClick={handleDeleteLogDir}
                      style={{
                        width: "80px",
                        height: "40px",
                        fontSize: "1rem",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane tabId="3">
            <div className="row">
              <div
                className="col-md-12 pr-2"
                style={{
                  border: "1px solid #ccc",
                  padding: "1rem",
                }}
              >
                <h3>Payment Limit</h3>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    G-Cash:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.gcashLimit}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.gcashLimit, (value) =>
                          setPreferences({
                            ...preferences,
                            gcashLimit: value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    VISA:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.visaLimit}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.visaLimit, (value) =>
                          setPreferences({
                            ...preferences,
                            visaLimit: value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    Master:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.masterLimit}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.masterLimit, (value) =>
                          setPreferences({
                            ...preferences,
                            masterLimit: value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    American Express:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.amexLimit}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.amexLimit, (value) =>
                          setPreferences({
                            ...preferences,
                            amexLimit: value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    Debit:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.debitLimit}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.debitLimit, (value) =>
                          setPreferences({
                            ...preferences,
                            debitLimit: value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    JCB:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.jcbLimit}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.jcbLimit, (value) =>
                          setPreferences({
                            ...preferences,
                            jcbLimit: value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane tabId="4">
            <div className="row">
              <div
                className="col-md-12"
                style={{
                  border: "1px solid #ccc",
                  padding: "1rem",
                }}
              >
                <h3>Count</h3>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    Table Count:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.tableCount}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.tableCount, (value) =>
                          setPreferences({
                            ...preferences,
                            tableCount: value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    Default Balance:
                  </label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={preferences.balance}
                      readOnly={!canEdit}
                      onClick={() =>
                        showNumberPopup(preferences.balance, (value) =>
                          setPreferences({
                            ...preferences,
                            balance: value,
                          })
                        )
                      }
                    />
                  </div>
                </div>
                <div className="form-group row m-b-15">
                  <label className="col-md-4 col-form-label form-control-lg">
                    Receipt Width:
                  </label>
                  <div className="col-md-8">
                    <select
                      className="form-control form-control-lg"
                      value={preferences.receiptWidth || "80mm"}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          receiptWidth: e.target.value,
                        })
                      }
                      disabled={!canEdit}
                    >
                      <option value="80mm">80mm</option>
                      <option value="58mm">58mm</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
        </TabContent>
        <div className="button-container">
          <button
            className="btn btn-primary m-l-10"
            style={{ width: "100px", height: "40px", fontSize: "1rem" }}
            onClick={onSave}
          >
            SAVE
          </button>
          <button
            className="btn btn-secondary m-l-10"
            style={{ width: "100px", height: "40px", fontSize: "1rem" }}
            onClick={onCancel}
          >
            Cancel
          </button>
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
      <MessagePopup
        isOpen={message.isOpen}
        onClose={() => setMessage({ isOpen: false, message: "" })}
        message={message.message}
      />
    </Modal>
  );
};

export default PreferencePopup;
