import { Modal, ModalBody, ModalHeader } from "reactstrap";
import React, { useState, useEffect } from "react";
import TextPopup from "./text";
import axios from "axios";
import dayjs from "dayjs";
import DateTime from "react-datetime";
import { useBalance } from "../../contexts/BalanceContext";
import JEPETTO_API_URL from "../../utils/JepettoApiUrl";

const OrderSearchPopup = ({ isOpen, onClose, members, loggedInMemberId }) => {
  const [salesInvoiceNo, setSalesInvoiceNo] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [searchDate, setSearchDate] = useState(dayjs().format("YYYY-MM-DD"));
  const { balance } = useBalance();

  const [selectedRow, setSelectedRow] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [textPopup, toggleTextPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
  });

  const toggleModal = () => {
    setAlertMessage("");
    setSearchResult([]);
    setSalesInvoiceNo("");
    setOrderNo("");
    setSearchDate(dayjs().format("YYYY-MM-DD"));
    setSelectedCashier(loggedInMemberId);
    onClose?.();
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

  const getDefaultCashierName = () => {
    const loggedInMember = members.find(
      (member) => member.mb_id === loggedInMemberId
    );
    return loggedInMember ? loggedInMember.mb_name : "";
  };

  const [selectedCashier, setSelectedCashier] = useState(loggedInMemberId);

  useEffect(() => {
    if (isOpen) {
      setSelectedCashier(loggedInMemberId);
      setIsInitialLoad(true);
    }
  }, [isOpen, loggedInMemberId]);

  const getStatusText = (status) => {
    switch (status) {
      case "주문":
        return "Pending";
      case "입금":
        return "Deposit";
      case "배송":
        return "Delivery";
      case "완료":
        return "Done";
      case "취소":
        return "Cancel";
      default:
        return status;
    }
  };

  const onSearch = async () => {
    if (!salesInvoiceNo && !orderNo && !searchDate && !selectedCashier) {
      setAlertMessage("Please enter at least one search criteria.");
      return;
    } else {
      setAlertMessage("");
    }

    const jsonData = {
      function: "getorder",
      item: {
        od_status: "",
        from: searchDate,
        to: searchDate
          ? dayjs(searchDate).add(1, "day").format("YYYY-MM-DD")
          : "",
        od_id: orderNo,
        pos_invoice_no: salesInvoiceNo,
        cashier_id: selectedCashier,
      },
    };

    let config = {
      method: "post",
      url: JEPETTO_API_URL,
      data: jsonData,
    };

    try {
      const response = await axios.request(config);

      if (Array.isArray(response.data)) {
        setSearchResult(response.data);
        setAlertMessage("");
      } else {
        console.error("Response data is not an array:", response.data);
        setSearchResult([]);
      }
    } catch (error) {
      console.error("Error fetching delivery orders:", error);
    }
  };

  const groupOrdersByOdId = (orders) => {
    const groupedOrders = new Map();

    orders.forEach((order) => {
      const { od_id, ...rest } = order;

      if (!groupedOrders.has(od_id)) {
        groupedOrders.set(od_id, { od_id, ...rest });
      }
    });

    return Array.from(groupedOrders.values());
  };

  const groupedSearchResult = groupOrdersByOdId(searchResult);

  const onApply = (selectedOdId, selectedBuyType) => {
    if (selectedRow === "") {
      alert("Please select an order.");
      return;
    }
    const isOrderRefundable = isRefundable(
      groupedSearchResult[selectedRow].od_time
    );
    onClose(selectedOdId, selectedBuyType, isOrderRefundable);
    setSearchResult([]);
    setSalesInvoiceNo("");
    setOrderNo("");
    setSearchDate(dayjs().format("YYYY-MM-DD"));
    setSelectedCashier(loggedInMemberId);
    setSelectedRow("");
    setAlertMessage("");
  };

  const selectRow = (index) => {
    setSelectedRow(index);
    const selectedOdId = groupedSearchResult[index].od_id;
  };

  const isRefundable = (orderDate) => {
    const today = dayjs();
    const orderDay = dayjs(orderDate);
    return today.diff(orderDay, "day") <= 7;
  };

  // todo
  const generateQuickReport = async () => {
    const { od_sum, cash_sum, card_sum, cash_count, card_count } =
      groupedSearchResult.reduce(
        (acc, cur) => {
          const cashAmount = cur.cash_amount;
          const cardAmount = cur.card_amount;

          if (!(cashAmount === 0 || cashAmount === "" || cashAmount === " ")) {
            acc.cash_sum += Number(cashAmount);
            acc.cash_count += 1;
          }

          if (!(cardAmount === 0 || cardAmount === "" || cardAmount === " ")) {
            acc.card_sum += Number(cardAmount);
            acc.card_count += 1;
          }

          acc.od_sum += Number(cur.od_cart_price);

          return acc;
        },
        { od_sum: 0, cash_sum: 0, card_sum: 0, cash_count: 0, card_count: 0 }
      );

    const selectedCashierName = members.find(
      (member) => member.mb_id === selectedCashier
    )?.mb_name;

    const data = {
      function: "quick_report",
      report: {
        total: String(od_sum),
        cash_sum: String(cash_sum),
        card_sum: String(card_sum),
        cash_count: String(cash_count),
        card_count: String(card_count),
        now_cash: String(balance),
        total_count: String(groupedSearchResult.length),
        cashier: selectedCashierName ? selectedCashierName : "",
        from: searchDate ? searchDate : "",
        to: searchDate ? searchDate : "",
        order_no: String(orderNo) ? String(orderNo) : "",
      },
    };

    const jsonData = JSON.stringify(data);
    let config = {
      method: "post",
      url: "/api/gazapos/HomeServlet",
      withCredentials: true,
      data: jsonData,
    };

    try {
      const response = await axios.request(config);
    } catch (error) {
      console.error("Error updating order data:", error);
    }
  };

  const resetSearchOptions = () => {
    setSalesInvoiceNo("");
    setOrderNo("");
    setSearchDate("");
    setSelectedCashier("");
    setSearchResult([]);
    setAlertMessage("");
    setIsInitialLoad(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggleModal}
      style={{ maxWidth: "1000px" }}
      fade={false}
      centered
      className="order-search-popup"
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
        Order Search
      </ModalHeader>
      <ModalBody>
        <div className="d-flex">
          <div className="flex-column mr-3" style={{ width: "80%" }}>
            <div className="form-row mb-3">
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center">
                  <label
                    className="control-label form-control-lg mb-0"
                    style={{ width: "40%" }}
                  >
                    POS Invoices No:
                  </label>
                  <div style={{ width: "60%" }}>
                    <input
                      type="text"
                      className="form-control"
                      value={salesInvoiceNo}
                      onClick={() =>
                        showTextPopup(salesInvoiceNo, setSalesInvoiceNo)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center">
                  <label
                    className="control-label form-control-lg mb-0"
                    style={{ width: "40%" }}
                  >
                    Order No:
                  </label>
                  <div style={{ width: "60%" }}>
                    <input
                      type="text"
                      className="form-control"
                      value={orderNo}
                      onClick={() => showTextPopup(orderNo, setOrderNo)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center">
                  <label
                    className="control-label form-control-lg mb-0"
                    style={{ width: "40%" }}
                  >
                    Date:
                  </label>
                  <div style={{ width: "60%" }}>
                    {searchDate ? (
                      <DateTime
                        dateFormat={"YYYY-MM-DD"}
                        timeFormat={false}
                        value={searchDate}
                        closeOnSelect={true}
                        className="custom-datetime"
                        onChange={(date) =>
                          setSearchDate(date ? date.format("YYYY-MM-DD") : "")
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Click to Select Date"
                        onClick={() =>
                          setSearchDate(dayjs().format("YYYY-MM-DD"))
                        }
                        readOnly
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center">
                  <label
                    className="control-label form-control-lg mb-0"
                    style={{ width: "40%" }}
                  >
                    Cashier:
                  </label>
                  <div style={{ width: "60%" }}>
                    <select
                      className="form-control"
                      value={selectedCashier}
                      onChange={(e) => {
                        setSelectedCashier(e.target.value);
                        setIsInitialLoad(false);
                      }}
                    >
                      <option value="">
                        {isInitialLoad
                          ? getDefaultCashierName()
                          : "Select Cashier"}
                      </option>
                      {members
                        .filter((member) => member.mb_level === 5)
                        .map((member) => (
                          <option key={member.mb_id} value={member.mb_id}>
                            {member.mb_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ width: "20%" }}
          >
            <button
              className="btn btn-info btn-sm mb-2"
              onClick={onSearch}
              style={{ width: "100px" }}
            >
              Search
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={resetSearchOptions}
              style={{ width: "100px" }}
            >
              Reset
            </button>
          </div>
        </div>
        {alertMessage && (
          <div className="form-group row mt-2">
            <div className="col-md-12 text-danger text-center">
              {alertMessage}
            </div>
          </div>
        )}
        <div className="mt-3">
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table
              className="table table-bordered"
              style={{ textAlign: "center" }}
            >
              <thead>
                <tr>
                  <th style={{ width: "24%" }}>Order No</th>
                  <th style={{ width: "7%" }}>Cashier</th>
                  <th style={{ width: "16%" }}>Sales Date</th>
                  <th style={{ width: "8%" }}>Price</th>
                  <th style={{ width: "13%" }}>Payment Type</th>
                  <th style={{ width: "9%" }}>Buy Type</th>
                  <th style={{ width: "15%" }}>DC Info</th>
                  <th style={{ width: "8%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {groupedSearchResult.length > 0 ? (
                  groupedSearchResult.map((item, index) => {
                    const refundable = isRefundable(item.od_time);
                    return (
                      <tr
                        key={item.od_id}
                        className={`
                          order-row
                          ${!refundable ? "non-refundable-row" : ""}
                          ${selectedRow === index ? "selected" : ""}
                        `}
                        onDoubleClick={() => {
                          setSelectedRow(index);
                          onApply(
                            groupedSearchResult[index]?.od_id,
                            groupedSearchResult[index]?.buyType
                          );
                        }}
                        onClick={() => selectRow(index)}
                      >
                        <td>
                          {item.pos_invoice_no}
                          <br />
                          {item.od_id}
                        </td>
                        <td>{item.start_cashier_name}</td>
                        <td>
                          {dayjs(item.od_time).format("YYYY-MM-DD HH:mm")}
                        </td>
                        <td
                          style={{ textAlign: "right", paddingRight: "10px" }}
                        >
                          {item.od_cart_price.currencyFormat()}
                        </td>
                        <td>{item.od_payment_type}</td>
                        <td>
                          {item.buyType === "C"
                            ? "Common"
                            : item.buyType === "S"
                            ? "Senior"
                            : "Whole"}
                        </td>
                        <td>
                          {item.buyType === "C"
                            ? "-"
                            : item.buyType === "S"
                            ? `${item.od_senior_name} / ${item.seniorNo}`
                            : item.od_wholesale_name}
                        </td>
                        <td>{getStatusText(item.od_status)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8}>No Data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-1">
            <button
              className="btn btn-primary btn-lg mr-2"
              onClick={generateQuickReport}
              style={{ width: "auto", height: "auto" }}
            >
              Quick Report
            </button>
            <button
              className="btn btn-success btn-lg"
              onClick={() => {
                const selectedOrder = groupedSearchResult[selectedRow];
                if (selectedOrder) {
                  onApply(selectedOrder.od_id, selectedOrder.buyType);
                } else {
                  setAlertMessage("Please select an order.");
                }
              }}
            >
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

export default OrderSearchPopup;
