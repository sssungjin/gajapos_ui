import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import DateTime from "react-datetime";
import classnames from "classnames";
import NumberPopup from "../popup/number";
import axios from "axios";
import DeliveryInfo from "./DeliveryInfo";
import { useBalance } from "../../contexts/BalanceContext";
import JEPETTO_API_URL from "../../utils/JepettoApiUrl";

const DeliveryFragment = ({
  members,
  selectedOrder,
  setSelectedOrder,
  deliveryInfoData,
  setDeliveryInfoData,
  selectedStatus,
  setSelectedStatus,
  from,
  setFrom,
  to,
  setTo,
  selectedRow,
  setSelectedRow,
  setSelectedOrderId,
  loggedInMemberName,
  loggedInMemberId,
}) => {
  const [today, setToday] = useState(true);
  const [week, setWeek] = useState(false);
  const [month, setMonth] = useState(false);
  const [deposit, setDeposit] = useState(0);
  const [change, setChange] = useState(0);
  const { balance, updateBalance } = useBalance();

  const [numberPopup, toggleNumberPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
    maxDigits: 16,
    isCardNumber: false,
  });

  useEffect(() => {
    onSearch();
  }, []);

  useEffect(() => {
    if (selectedRow) {
      onRowSelect(selectedOrder, selectedRow);
    }
  }, [deliveryInfoData]);

  const onSearch = async () => {
    const jsonData = {
      function: "getorder",
      item: {
        od_status: selectedStatus,
        from: from,
        to: to,
        od_id: "",
        pos_invoice_no: "",
        cashier_id: "",
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
        setDeliveryInfoData(response.data);
      } else {
        console.error("Response data is not an array:", response.data);
        setDeliveryInfoData([]);
      }
    } catch (error) {
      console.error("Error fetching delivery orders:", error);
    }
  };

  const handleStatusClick = (value) => {
    setSelectedStatus((prevSelectedStatus) =>
      prevSelectedStatus === value ? "" : value
    );
  };

  const handleDateClick = (days) => {
    setToday(days === 1 ? !today : false);
    setWeek(days === 7 ? !week : false);
    setMonth(days === 30 ? !month : false);

    if (today && days === 1) {
      setFrom("");
      setTo("");
    } else if (week && days === 7) {
      setFrom("");
      setTo("");
    } else if (month && days === 30) {
      setFrom("");
      setTo("");
    } else {
      switch (days) {
        case 1:
          setFrom(dayjs().format("YYYY-MM-DD"));
          setTo(dayjs().format("YYYY-MM-DD"));
          break;
        case 7:
          setFrom(dayjs().startOf("week").format("YYYY-MM-DD"));
          setTo(dayjs().endOf("week").format("YYYY-MM-DD"));
          break;
        case 30:
          setFrom(dayjs().startOf("month").format("YYYY-MM-DD"));
          setTo(dayjs().endOf("month").format("YYYY-MM-DD"));
          break;
        default:
      }
    }
  };

  const preProcessMembers = (members) => {
    const cashiers = [];
    const managers = [];
    const riders = [];

    if (Array.isArray(members)) {
      members.forEach((member) => {
        const { mb_id, mb_name, mb_nick, mb_level } = member;

        switch (mb_level) {
          case 5:
            riders.push({ id: mb_id, name: mb_nick });
            break;
          case 6:
            cashiers.push({ id: mb_id, name: mb_nick });
            break;
          case 10:
            managers.push({ id: mb_id, name: mb_nick });
            break;
          default:
            break;
        }
      });
    }

    return { cashiers, managers, riders };
  };

  const { cashiers, managers, riders } = preProcessMembers(members);

  const onRowSelect = (selectedOrder, index) => {
    setSelectedRow(index);

    const {
      orderer,
      order_mobile,
      order,
      orderer_addr,
      od_time,
      od_b_name,
      od_b_tel,
      od_b_hp,
      receiver_addr,
      od_id,
      od_total_ext,
      od_total_vat,

      od_db_start_cashier,
      od_db_start_manager,
      rider,
      rider_name,
      od_db_end_cashier,
      od_db_end_manager,
      od_db_start_time,
      od_db_end_time,
      od_status,
      od_db_changes,
      od_db_deposit,
      start_cashier_name,
      start_manager_name,
      end_cashier_name,
      end_manager_name,
      od_db_start,
      od_db_end,

      balance,
      buyType,
      card_num,
      cash_amount,
      card_amount,
      pos_invoice_no,
      od_cart_price,
      od_senior_name,
      seniorNo,
      posSerialNo,
      ct_price,
      spp_vat,
      mb_id,
    } = selectedOrder;

    setSelectedOrder({
      orderer,
      order_mobile,
      order,
      orderer_addr,
      od_time,
      od_b_name,
      od_b_tel,
      od_b_hp,
      receiver_addr,
      od_id,
      od_total_ext,
      od_total_vat,

      od_db_start_cashier,
      od_db_start_manager,
      rider,
      rider_name,
      od_db_end_cashier,
      od_db_end_manager,
      od_db_start_time,
      od_db_end_time,
      od_status,
      od_db_changes,
      od_db_deposit,
      start_cashier_name,
      start_manager_name,
      end_cashier_name,
      end_manager_name,
      od_db_start,
      od_db_end,

      balance,
      buyType,
      card_num,
      cash_amount,
      card_amount,
      pos_invoice_no,
      od_cart_price,
      od_senior_name,
      seniorNo,
      posSerialNo,
      ct_price,
      spp_vat,
      mb_id,
    });
    setSelectedOrderId(selectedOrder.od_id);
  };

  const showNumberPopup = (data, setter, maxDigits, isCardNumber) =>
    toggleNumberPopup({
      isOpen: true,
      data,
      setter,
      maxDigits,
      isCardNumber,
    });

  const hideNumberPopup = () =>
    toggleNumberPopup({
      isOpen: false,
      data: "",
      setter: null,
      maxDigits: 16,
      isCardNumber: false,
    });

  const handleChange = (field, value) => {
    switch (field) {
      case "rider":
        setSelectedOrder((prevOrder) => ({
          ...prevOrder,
          rider: value,
        }));
        break;
      case "manager1":
        setSelectedOrder((prevOrder) => ({
          ...prevOrder,
          od_db_start_manager: value,
        }));
        break;
      case "manager2":
        setSelectedOrder((prevOrder) => ({
          ...prevOrder,
          od_db_end_manager: value,
        }));
        break;
      case "deposit":
        setDeposit(value);
        break;
      case "change":
        setChange(value);
        break;
      default:
        break;
    }
  };

  const onStart = () => {
    if (selectedOrder) {
      const filteredData = selectedOrder.od_id
        ? deliveryInfoData.filter((item) => item.od_id === selectedOrder.od_id)
        : [];
      const tmpItem = filteredData[0];

      let exampt = 0;
      let vatable = 0;
      filteredData.forEach((item) => {
        if (parseFloat(item.spp_vat) === 0) {
          exampt += parseFloat(item.ct_price) * item.qty;
        } else {
          vatable += parseFloat(item.ct_price) * item.qty;
        }
      });
      exampt = Math.round(exampt * 100) / 100;
      let price =
        Math.round((parseFloat(tmpItem.od_total_ext) - exampt) * 100) / 100;
      updateBalance(Number(deposit));

      const data = {
        function: "delivery_start",
        items: filteredData.map((item) => ({
          it_name: String(item.en_it_name),
          cnt: String(item.ct_qty),
          whole_base_sale_price: String(item.ct_price),
          buyType: String(item.buyType),
          cashier_id: String(item.od_db_start_cashier),
          cashier_name: String(item.od_db_start_cashier_name),
          is_senior_dc: String(item.spp_is_senior_dc),
          it_barcode: String(item.it_barcode),
          it_id: String(item.it_id),
          order_serial: String(item.od_serial), // todo?
          orderdate: String(item.od_time),
          pos_invoice_no: String(item.pos_invoice_no),
          pos_serial: String(item.posSerialNo),
          retail_base_dc_price: "0",
          retail_base_price: String(item.spp_retail_base_price),
          retail_disc_ratio: String(item.spp_retail_dis_ratio),
          retail_margin: "0",
          retail_margin_ratio: String(item.spp_retail_margin_ratio),
          retail_sale_dc_price: String(item.spp_retail_dc_price),
          retail_sale_price: String(item.spp_retail_sale_price),
          senior_base_sale_price: "0",
          senior_disc_ratio: String(item.spp_senior_disc_ratio),
          senior_sale_price: String(item.spp_senior_sale_price),
          spp_purchase_price: String(item.spp_purchase_price),
          spp_vat: String(item.spp_vat),
          whole_disc_ratio: String(item.spp_whole_dis_ratio),
          whole_sale_price: String(item.spp_whole_sale_price),
        })),
        order: {
          balance: String(balance),
          buyType: String(selectedOrder.buyType),
          orderNo: String(selectedOrder.od_id),
          pos_invoice_no: String(selectedOrder.pos_invoice_no),
          serialNo: String(selectedOrder.posSerialNo),
          seniorNo: String(selectedOrder.seniorNo),
          seniorName: String(selectedOrder.od_senior_name),
          price: String(tmpItem.od_total_ext),
          vat: String(tmpItem.od_total_vat),
          cash_amount: String(selectedOrder.cash_amount),
          card_amount: String(selectedOrder.card_amount),
          cardnum: String(selectedOrder.card_num),
          sum: String(selectedOrder.od_cart_price),
          regdate: String(selectedOrder.od_time),
          //state: "DELIVERY_START",
          state: "주문",
          start_cashier_id: String(loggedInMemberId),
          start_cashier_name: String(loggedInMemberName),
          start_manager_id: String(
            managers.find(
              (manager) => manager.id === selectedOrder.od_db_start_manager
            )?.id || ""
          ),
          start_manager_name: String(
            managers.find(
              (manager) => manager.id === selectedOrder.od_db_start_manager
            )?.name || ""
          ),
          start_time: String(dayjs().format("YYYY-MM-DD HH:mm:ss")),
          deposit: String(deposit || "0"),
          finish_cashier_id: "",
          finish_cashier_name: "",
          finish_manager_id: "",
          finish_manager_name: "",
          finish_time: "",
          change: String(change || "0"),
          rider: String(selectedOrder.rider),
          rider_name: String(
            riders.find((rider) => rider.id === selectedOrder.rider)?.name || ""
          ),
          whole_sale_no: "",
          whole_sale_name: "",
          exampt: String(exampt),
          orderer: String(tmpItem.orderer),
          order_mobile: String(tmpItem.order_mobile),
          receiver_name: String(tmpItem.od_b_name),
          receiver_tel: String(tmpItem.od_b_tel),
          receiver_addr: String(tmpItem.receiver_addr),
          mb_id: String(selectedOrder.mb_id),
        },
      };

      updateOrderData(data);
    }
  };

  const onArrival = () => {
    if (selectedOrder) {
      const filteredData = selectedOrder.od_id
        ? deliveryInfoData.filter((item) => item.od_id === selectedOrder.od_id)
        : [];
      const tmpItem = filteredData[0];

      let exampt = 0;
      let vatable = 0;
      filteredData.forEach((item) => {
        if (parseFloat(item.spp_vat) === 0) {
          exampt += parseFloat(item.ct_price) * item.qty;
        } else {
          vatable += parseFloat(item.ct_price) * item.qty;
        }
      });
      exampt = Math.round(exampt * 100) / 100;
      let price =
        Math.round((parseFloat(tmpItem.od_total_ext) - exampt) * 100) / 100;
      updateBalance(-Number(change));

      const data = {
        function: "delivery_end",
        items: filteredData.map((item) => ({
          it_name: String(item.en_it_name),
          cnt: String(item.ct_qty),
          whole_base_sale_price: String(item.ct_price),
          buyType: String(item.buyType),
          cashier_id: String(item.od_db_start_cashier),
          cashier_name: String(item.od_db_start_cashier_name),
          is_senior_dc: String(item.spp_is_senior_dc),
          it_barcode: String(item.it_barcode),
          it_id: String(item.it_id),
          order_serial: String(item.od_serial),
          orderdate: String(item.od_time),
          pos_invoice_no: String(item.pos_invoice_no),
          pos_serial: String(item.posSerialNo),
          retail_base_dc_price: "0",
          retail_base_price: String(item.spp_retail_base_price),
          retail_disc_ratio: String(item.spp_retail_dis_ratio),
          retail_margin: "0",
          retail_margin_ratio: String(item.spp_retail_margin_ratio),
          retail_sale_dc_price: String(item.spp_retail_dc_price),
          retail_sale_price: String(item.spp_retail_sale_price),
          senior_base_sale_price: "0",
          senior_disc_ratio: String(item.spp_senior_disc_ratio),
          senior_sale_price: String(item.spp_senior_sale_price),
          spp_purchase_price: String(item.spp_purchase_price),
          spp_vat: String(item.spp_vat),
          whole_disc_ratio: String(item.spp_whole_dis_ratio),
          whole_sale_price: String(item.spp_whole_sale_price),
        })),
        order: {
          balance: String(balance),
          buyType: String(selectedOrder.buyType),
          orderNo: String(selectedOrder.od_id),
          pos_invoice_no: String(selectedOrder.pos_invoice_no),
          serialNo: String(selectedOrder.posSerialNo),
          seniorNo: String(selectedOrder.seniorNo),
          seniorName: String(selectedOrder.od_senior_name),
          price: String(tmpItem.od_total_ext),
          vat: String(tmpItem.od_total_vat),
          cash_amount: String(selectedOrder.cash_amount),
          card_amount: String(selectedOrder.card_amount),
          cardnum: String(selectedOrder.card_num),
          sum: String(selectedOrder.od_cart_price),
          regdate: String(selectedOrder.od_time),
          // state: "DELIVERY_END",
          state: "완료",
          start_cashier_id: String(selectedOrder.od_db_start_cashier),
          start_cashier_name: String(selectedOrder.start_cashier_name),
          start_manager_id: String(selectedOrder.od_db_start_manager),
          start_manager_name: String(selectedOrder.start_manager_name),
          start_time: String(selectedOrder.od_db_start_time),
          deposit: String(deposit || "0"),
          finish_cashier_id: String(loggedInMemberId),
          finish_cashier_name: String(loggedInMemberName),
          finish_manager_id: String(
            managers.find(
              (manager) => manager.id === selectedOrder.od_db_end_manager
            )?.id || ""
          ),
          finish_manager_name: String(
            managers.find(
              (manager) => manager.id === selectedOrder.od_db_end_manager
            )?.name || ""
          ),
          finish_time: String(dayjs().format("YYYY-MM-DD HH:mm:ss")),
          change: String(change || "0"),
          rider: String(selectedOrder.rider),
          rider_name: String(selectedOrder.rider_name),
          whole_sale_no: "",
          whole_sale_name: "",
          exampt: String(exampt),
          orderer: String(tmpItem.orderer),
          order_mobile: String(tmpItem.order_mobile),
          receiver_name: String(tmpItem.od_b_name),
          receiver_tel: String(tmpItem.od_b_tel),
          receiver_addr: String(tmpItem.receiver_addr),
          mb_id: String(selectedOrder.mb_id),
        },
      };

      updateOrderData(data);
    }
  };

  const updateOrderData = async (orderData) => {
    const jsonData = JSON.stringify(orderData);

    let config = {
      method: "post",
      url: JEPETTO_API_URL,
      withCredentials: true,
      data: jsonData,
    };

    try {
      const response = await axios.request(config);
    } catch (error) {
      console.error("Error updating order data:", error);
    }
  };

  const onRollback = () => {};

  const onRemove = () => {};

  const isFieldEditable = (field, selectedOrder) => {
    const isStarted = String(selectedOrder.od_db_start) === "1";
    const isFinished = String(selectedOrder.od_db_end) === "1";
    const { od_status } = selectedOrder;

    if (od_status === "주문" || od_status === "입금" || od_status === "배송") {
      if (!isStarted && !isFinished) {
        // od_db_start: 0, od_db_end: 0
        if (field === "cashier1") {
          return false;
        } else if (
          field === "rider_start" ||
          field === "manager1" ||
          field === "deposit"
        ) {
          return true;
        } else {
          return false;
        }
      } else if (isStarted && !isFinished) {
        // od_db_start: 1, od_db_end: 0
        if (
          field === "cashier1" ||
          field === "cashier2" ||
          field === "rider_start"
        ) {
          return false;
        } else if (field === "manager2" || field === "change") {
          return true;
        } else {
          return false;
        }
      } else if (isStarted && isFinished) {
        // od_db_start: 1, od_db_end: 1
        return false; // 모든 필드 수정 불가능
      }
    }

    return false;
  };

  useEffect(() => {
    if (selectedOrder) {
      setDeposit(selectedOrder.od_db_deposit);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (selectedOrder) {
      setDeposit(selectedOrder.od_db_changes);
    }
  }, [selectedOrder]);

  return (
    <div className="delivery">
      <div className="row">
        <div className="col-auto m-b-4">
          <button
            className={classnames([
              "btn",
              selectedStatus === "주문" ? "btn-success" : "btn-outline-primary",
            ])}
            onClick={() => handleStatusClick("주문")}
          >
            Pending
          </button>
          <button
            className={classnames([
              "btn m-l-5",
              selectedStatus === "입금" ? "btn-success" : "btn-outline-primary",
            ])}
            onClick={() => handleStatusClick("입금")}
          >
            Deposit
          </button>
          <button
            className={classnames([
              "btn m-l-5",
              selectedStatus === "배송" ? "btn-success" : "btn-outline-primary",
            ])}
            onClick={() => handleStatusClick("배송")}
          >
            Delivery
          </button>
          <button
            className={classnames([
              "btn m-l-5",
              selectedStatus === "완료" ? "btn-success" : "btn-outline-primary",
            ])}
            onClick={() => handleStatusClick("완료")}
          >
            Done
          </button>
        </div>
        <div className="col-auto ml-auto m-b-5 d-flex">
          <button
            className={classnames([
              "btn",
              today ? "btn-success" : "btn-outline-primary",
            ])}
            onClick={() => handleDateClick(1)}
          >
            Today
          </button>
          <button
            className={classnames([
              "btn m-l-5",
              week ? "btn-success" : "btn-outline-primary",
            ])}
            onClick={() => handleDateClick(7)}
          >
            Week
          </button>
          <button
            className={classnames([
              "btn m-l-5",
              month ? "btn-success" : "btn-outline-primary",
            ])}
            onClick={() => handleDateClick(30)}
          >
            Month
          </button>
          <DateTime
            dateFormat={"YYYY-MM-DD"}
            timeFormat={false}
            value={from || ""}
            closeOnSelect={true}
            className="m-l-5 custom-datetime"
            onChange={(e) => {
              if (typeof e === "string") {
                setFrom(e);
              } else {
                setFrom(e.format("YYYY-MM-DD"));
              }
            }}
          />
          <label>&nbsp;~&nbsp;</label>
          <DateTime
            dateFormat={"YYYY-MM-DD"}
            timeFormat={false}
            value={to || ""}
            closeOnSelect={true}
            className="custom-datetime"
            onChange={(e) => {
              if (typeof e === "string") {
                setTo(e);
              } else {
                setTo(e.format("YYYY-MM-DD"));
              }
            }}
          />
          <button className="btn btn-primary m-l-10" onClick={onSearch}>
            Search
          </button>
        </div>
      </div>
      <DeliveryInfo
        deliveryOrders={deliveryInfoData}
        onRowSelect={onRowSelect}
        selectedRow={selectedRow}
      />
      <h4>
        <u>Handler</u>
      </h4>
      <table className="table table-td-valign-middle table-th-valign-middle table-bordered table-hover table-responsive-sm bg-white">
        <thead className="bg-inverse text-white">
          <tr className="text-center">
            <th colSpan={4} style={{ width: "50%" }}>
              Start
            </th>
            <th colSpan={4} style={{ width: "50%" }}>
              Arrival
            </th>
          </tr>
          <tr className="text-center">
            <th style={{ width: "12.5%" }}>Cashier</th>
            <th style={{ width: "12.5%" }}>Rider</th>
            <th style={{ width: "12.5%" }}>Manager</th>
            <th style={{ width: "12.5%" }}>Deposit</th>
            <th style={{ width: "12.5%" }}>Cashier</th>
            <th style={{ width: "12.5%" }}>Rider</th>
            <th style={{ width: "12.5%" }}>Manager</th>
            <th style={{ width: "12.5%" }}>Change</th>
          </tr>
        </thead>
        <tbody>
          {deliveryInfoData.length === 0 ||
          Object.keys(selectedOrder).length === 0 ? (
            <tr className="text-center">
              <td colSpan={8}>No Order Selected</td>
            </tr>
          ) : selectedOrder ? (
            <tr key={selectedOrder.od_id} className="text-center">
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={
                    selectedOrder.od_db_start_cashier || loggedInMemberName
                  }
                  style={{ textAlign: "center" }}
                  disabled
                />
              </td>
              <td>
                {!isFieldEditable("rider_start", selectedOrder) ? (
                  <input
                    type="text"
                    className="form-control"
                    value={selectedOrder.rider_name}
                    style={{ textAlign: "center" }}
                    disabled
                  />
                ) : (
                  <select
                    className="form-control"
                    value={selectedOrder.rider}
                    onChange={(e) => handleChange("rider", e.target.value)}
                    disabled={!isFieldEditable("rider_start", selectedOrder)}
                  >
                    {riders.map((rider) => (
                      <option key={rider.id} value={rider.id}>
                        {rider.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td>
                {!isFieldEditable("manager1", selectedOrder) ? (
                  <input
                    type="text"
                    className="form-control"
                    value={selectedOrder.od_db_start_manager}
                    style={{ textAlign: "center" }}
                    disabled
                  />
                ) : (
                  <select
                    className="form-control"
                    value={selectedOrder.od_db_start_manager}
                    onChange={(e) => handleChange("manager1", e.target.value)}
                    disabled={!isFieldEditable("manager1", selectedOrder)}
                  >
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td>
                <div
                  className={"form-control"}
                  onClick={() =>
                    isFieldEditable("deposit", selectedOrder) &&
                    showNumberPopup(deposit, (value) => setDeposit(value))
                  }
                  disabled={!isFieldEditable("deposit", selectedOrder)}
                  style={{
                    backgroundColor: isFieldEditable("deposit", selectedOrder)
                      ? "white"
                      : "#e9ecef",
                    textAlign: "right",
                  }}
                >
                  {Number(deposit).currencyFormat()}
                </div>
              </td>

              <td>
                <input
                  type="text"
                  className="form-control"
                  value={selectedOrder.od_db_end_cashier || loggedInMemberName}
                  style={{ textAlign: "center" }}
                  disabled
                />
              </td>
              <td>
                {!isFieldEditable("rider_arrival", selectedOrder) ? (
                  <input
                    type="text"
                    className="form-control"
                    value={selectedOrder.rider_name}
                    style={{ textAlign: "center" }}
                    disabled
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={selectedOrder.rider}
                    disabled={!isFieldEditable("rider_arrival", selectedOrder)}
                  />
                )}
              </td>
              <td>
                {!isFieldEditable("manager2", selectedOrder) ? (
                  <input
                    type="text"
                    className="form-control"
                    value={selectedOrder.od_db_end_manager}
                    style={{ textAlign: "center" }}
                    disabled
                  />
                ) : (
                  <select
                    className="form-control"
                    value={selectedOrder.od_db_end_manager}
                    onChange={(e) => handleChange("manager2", e.target.value)}
                    disabled={!isFieldEditable("manager2", selectedOrder)}
                  >
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td>
                <div
                  className={"form-control"}
                  disabled={!isFieldEditable("change", selectedOrder)}
                  onClick={() =>
                    isFieldEditable("change", selectedOrder) &&
                    showNumberPopup(change, (value) => setChange(value))
                  }
                  style={{
                    backgroundColor: isFieldEditable("change", selectedOrder)
                      ? "white"
                      : "#e9ecef",
                    textAlign: "right",
                  }}
                >
                  {Number(change).currencyFormat()}
                </div>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <div className="bottom-button">
        <div className="button-set">
          <h4 className="control-label">START</h4>
          <div className="btn-group">
            <button
              className="btn btn-lg btn-success"
              onClick={() => onStart()}
              disabled={selectedRow === null}
              style={{ padding: "0px", lineHeight: "1" }}
            >
              START & OPEN
            </button>
          </div>
        </div>
        <div className="button-set">
          <h4 className="control-label">ARRIVAL</h4>
          <div className="btn-group">
            <button
              className="btn btn-lg btn-success"
              onClick={onArrival}
              disabled={selectedRow === null}
              style={{ padding: "0px", lineHeight: "1" }}
            >
              DONE & OPEN
            </button>
          </div>
        </div>
        <div className="button-set">
          <h4 className="control-label">EDIT</h4>
          <div className="btn-group">
            <button
              className="btn btn-lg btn-dark"
              onClick={() => onRollback(selectedOrder)}
              disabled={selectedRow === null}
              style={{ padding: "0px", lineHeight: "1" }}
            >
              ROLLBACK
            </button>
            <button
              className="btn btn-lg btn-danger"
              onClick={onRemove}
              disabled={selectedRow === null}
              style={{ padding: "0px", lineHeight: "1" }}
            >
              REMOVE
            </button>
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default DeliveryFragment;
