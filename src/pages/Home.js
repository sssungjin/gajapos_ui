import React, { useState, useRef, useEffect, useCallback } from "react";
import LoginPopup from "./popup/login";
import dayjs from "dayjs";
import classnames from "classnames";
import PreferencePopup from "./popup/preference";
import Main from "./Main";
import Delivery from "./Delivery";
import SeniorDiscountPopup from "./popup/senior";
import WholeSalePopup from "./popup/whole";
import Payment from "./Payment";
import PreferenceLoginPopup from "./popup/preferenceLogin";
import axios from "axios";
import OrderSearchPopup from "./popup/orderSearch";
import ProductNotFoundPopup from "./popup/productNotFound";
import HoldPopup from "./popup/hold";
import { useAuth } from "../hooks/useAuth";
import JEPETTO_API_URL from "../utils/JepettoApiUrl";

const Home = () => {
  const { loginState, login, logout, toggleLoginPopup, refreshToken } =
    useAuth();

  const [popupState, setPopupState] = useState({
    preferencePopup: false,
    seniorPopup: false,
    wholePopup: false,
    orderSearchPopup: false,
    preferenceLoginPopup: false,
  });

  const [productNotFoundPopup, setProductNotFoundPopup] = useState({
    isOpen: false,
    barcode: "",
  });

  const [saleState, setSaleState] = useState({
    saleType: "retail",
    seniorNo: "",
    seniorName: "",
    wholeCompanyNo: "",
    wholeCompanyName: "",
  });

  const [totalState, setTotalState] = useState({
    homeTotalSum: 0,
    homeTotalExt: 0,
    homeTotalVat: 0,
  });

  const [scannedItems, setScannedItems] = useState([]);
  const [selectedOdId, setSelectedOdId] = useState("");
  const [delivery, setDelivery] = useState(0);
  const [isAdmin, setIsAdmin] = useState(true);
  const [members, setMembers] = useState([]);
  const [preferenceData, setPreferenceData] = useState([]);
  const [itemId, setItemId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [resetPayment, setResetPayment] = useState(false);
  const [isOrderRefundable, setIsOrderRefundable] = useState(false);
  const [holdItems, setHoldItems] = useState([]);
  const [holdPopupOpen, setHoldPopupOpen] = useState(false);
  const [balance, setBalance] = useState("");

  const barcodeInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("scannedItems", JSON.stringify(scannedItems));
    window.dispatchEvent(new Event("scannedItemsChanged"));
  }, [scannedItems]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }

      if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("saleType", saleState.saleType);
  }, [saleState.saleType]);

  const [membersFetched, setMembersFetched] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (membersFetched) return; // 이미 멤버 데이터를 가져왔다면 함수 실행을 중단

    const jsonData = {
      function: "getallmember",
      item: {},
    };

    let config = {
      method: "post",
      url: JEPETTO_API_URL,
      withCredentials: true,
      data: jsonData,
    };
    try {
      const response = await axios.request(config);
      setMembers(response.data);
      setMembersFetched(true); // 멤버 데이터를 성공적으로 가져왔음을 표시
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  }, [membersFetched]);

  useEffect(() => {
    if (loginState.isLogin && !membersFetched) {
      fetchMembers();
    }
  }, [loginState.isLogin, fetchMembers, membersFetched]);

  const onLogin = useCallback(async () => {
    if (loginState.isLogin) {
      const wantQuickReport = window.confirm(
        "Do you want to print a Quick Report?\nIf you click cancel, it will be logged out without quick report."
      );

      if (wantQuickReport) {
        const jsonData = {
          function: "getorder",
          item: {
            od_status: "",
            //from: loginState.lastLoginTime,
            from: "2024-06-01",
            to: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            od_id: "",
            pos_invoice_no: "",
            cashier_id: loginState.loggedInMemberId,
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
            const groupedOrders = groupOrdersByOdId(response.data);
            const report = generateQuickReport(groupedOrders);
          }
        } catch (error) {
          console.error("Error fetching orders for Quick Report:", error);
        }
      }

      logout();
      setDelivery(0);
      setSaleState({
        saleType: "retail",
        seniorNo: "",
        seniorName: "",
        wholeCompanyNo: "",
        wholeCompanyName: "",
      });
      updateSelectedOdId("");
      setIsOrderRefundable(false);
      resetScannedItems();
      setResetPayment((prev) => !prev);
      setTotalState({
        homeTotalSum: 0,
        homeTotalExt: 0,
        homeTotalVat: 0,
      });
    } else {
      if (
        window.confirm(
          `Are there more than ${balance}₱ in your current balance?\nDrawer Cash will be reset to ${balance}₱.`
        )
      ) {
        toggleLoginPopup(true);
      }
    }
  }, [loginState.isLogin, logout, toggleLoginPopup, balance]);

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

  const generateQuickReport = async (groupedOrders) => {
    const { od_sum, cash_sum, card_sum, cash_count, card_count } =
      groupedOrders.reduce(
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

    const data = {
      function: "quick_report",
      report: {
        total: String(od_sum),
        cash_sum: String(cash_sum),
        card_sum: String(card_sum),
        cash_count: String(cash_count),
        card_count: String(card_count),
        now_cash: String(balance),
        total_count: String(groupedOrders.length),
        cashier: loginState.loggedInMemberName,
        from: loginState.lastLoginTime,
        to: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        order_no: "",
      },
    };

    const jsonData = JSON.stringify(data);

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

    return data;
  };

  const onDelivery = () => {
    setDelivery((prev) => 1 - prev);
  };

  const onPreferences = useCallback(() => {
    setPopupState((prev) => ({ ...prev, preferenceLoginPopup: true }));
  }, []);

  const onSeniorDiscount = useCallback(() => {
    if (saleState.saleType === "senior") {
      setSaleState((prev) => ({ ...prev, saleType: "retail" }));
    } else {
      setPopupState((prev) => ({ ...prev, seniorPopup: true }));
    }
  }, [saleState.saleType]);

  const onWholeSale = useCallback(() => {
    if (saleState.saleType === "whole") {
      setSaleState((prev) => ({ ...prev, saleType: "retail" }));
    } else {
      setPopupState((prev) => ({ ...prev, wholePopup: true }));
    }
  }, [saleState.saleType]);

  const updateSelectedOdId = useCallback((newOdId) => {
    setSelectedOdId(newOdId);
    localStorage.setItem("selectedOdId", newOdId);
    window.dispatchEvent(new Event("selectedOdIdChanged"));
  }, []);

  const onOrderSearch = useCallback(() => {
    if (selectedOdId) {
      // 이미 선택된 주문 ID가 있는 경우 초기화
      updateSelectedOdId(""); // 새로운 함수 사용
      setIsOrderRefundable(false);
      setSaleState((prev) => ({ ...prev, saleType: "retail" }));
      setResetPayment((prev) => !prev);
    } else {
      setPopupState((prev) => ({ ...prev, orderSearchPopup: true }));
    }
  }, [selectedOdId, updateSelectedOdId]);

  const handleBarcodeInput = useCallback(
    async (e) => {
      const barcode = e.target.value;
      setItemId(barcode);

      const jsonData = {
        function: "getitem",
        item: {
          it_barcode: barcode,
        },
      };

      let config = {
        method: "post",
        url: JEPETTO_API_URL,
        withCredentials: true,
        data: jsonData,
      };

      if (barcode.length === 13) {
        try {
          const response = await axios.request(config);
          const item = response.data;

          // it_barcode가 비어있거나 응답 받은 데이터가 비어있는 경우 처리하지 않음
          if (!item.it_barcode || Object.keys(item).length === 0) {
            console.warn("Invalid item data:", item);
            setProductNotFoundPopup({ isOpen: true, barcode: barcode });
            setItemId("");
            return;
          }

          const processedItem = {
            id: item.it_id,
            barcode: item.it_barcode,
            ca_id: item.ca_id,
            sd_id: item.sd_id,
            sd_name: item.sd_name,
            it_name: item.it_name,
            it_en_name: item.it_en_name,
            it_img1: item.it_img1,
            it_img2: item.it_img2,
            is_senior_dc: item.spp_is_senior_dc,
            retail_dis_ratio: item.spp_retail_dis_ratio,
            senior_disc_ratio: item.spp_senior_disc_ratio,
            whole_dis_ratio: item.spp_whole_dis_ratio,
            spp_purchase_price: item.spp_purchase_price,
            retail_sale_price: item.spp_retail_sale_price,
            vat_ratio: item.spp_vat_ratio,
            net_vat: item.net_vat,
            vat: item.vat,
            spp_receipt_date: item.spp_receipt_date,
            expiration_date: item.expiration_date,
            qty: 1,
            uuid: crypto.randomUUID(),
          };

          setScannedItems((prev) => [...prev, processedItem]);
          setSelectedItem(processedItem);
          setItemId("");
        } catch (error) {
          console.error("Error in loading item info:", error);
          setProductNotFoundPopup({ isOpen: true, barcode: barcode });
        }
        setItemId("");
      }
      setDelivery(0);
    },
    [setScannedItems, setSelectedItem, setItemId, setDelivery]
  );

  const handleItemSave = (updatedItem) => {
    setScannedItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.uuid === updatedItem.uuid) {
          return updatedItem;
        }
        if (item.parentUuid === updatedItem.uuid) {
          // Update associated Bowl item
          return {
            ...item,
            qty: updatedItem.qty,
          };
        }
        return item;
      });

      // Check if Bowl item needs to be added or removed
      const bowlIndex = updatedItems.findIndex(
        (item) => item.parentUuid === updatedItem.uuid
      );

      if (updatedItem.isBowl && bowlIndex === -1) {
        // Add new Bowl item
        const bowlItem = createBowlItem(updatedItem);
        const itemIndex = updatedItems.findIndex(
          (item) => item.uuid === updatedItem.uuid
        );
        updatedItems.splice(itemIndex + 1, 0, bowlItem);
      } else if (!updatedItem.isBowl && bowlIndex !== -1) {
        // Remove existing Bowl item
        updatedItems.splice(bowlIndex, 1);
      }

      return updatedItems;
    });
  };

  const createBowlItem = (parentItem) => ({
    buyType: parentItem.buyType,
    cashier_id: parentItem.cashier_id,
    cashier_name: parentItem.cashier_name,
    qty: parentItem.qty,
    barcode: "2004210001305",
    id: "1720525392",
    sd_id: parentItem.sd_id,
    sd_name: parentItem.sd_name,
    it_en_name: "Bowl",
    it_name: "한강 라면",
    it_img1: parentItem.it_img1,
    it_img2: parentItem.it_img2,
    is_senior_dc: "0",
    retail_dis_ratio: 0,
    senior_disc_ratio: 0,
    whole_dis_ratio: 0,
    spp_purchase_price: 0,
    retail_sale_price: 130,
    vat_ratio: 0,
    net_vat: 0,
    vat: 0,
    spp_receipt_date: parentItem.spp_receipt_date,
    expiration_date: parentItem.expiration_date,
    uuid: `${parentItem.uuid}-bowl`,
    isBowl: true,
    parentUuid: parentItem.uuid,
  });

  const handleWholeDiscount = useCallback(
    (appliedSaleType, companyNo, companyName) => {
      setSaleState((prev) => ({
        ...prev,
        saleType: appliedSaleType,
        wholeCompanyNo: companyNo,
        wholeCompanyName: companyName,
      }));
    },
    []
  );

  const handleSeniorDiscount = useCallback(
    (appliedSaleType, seniorNo, seniorName) => {
      setSaleState((prev) => ({
        ...prev,
        saleType: appliedSaleType,
        seniorNo,
        seniorName,
      }));
    },
    []
  );

  const handleTotalSumHome = useCallback((sum) => {
    setTotalState((prev) => ({ ...prev, homeTotalSum: sum }));
  }, []);

  const handleTotalExtHome = useCallback((ext) => {
    setTotalState((prev) => ({ ...prev, homeTotalExt: ext }));
  }, []);

  const handleTotalVatHome = useCallback((vat) => {
    setTotalState((prev) => ({ ...prev, homeTotalVat: vat }));
  }, []);

  const resetScannedItems = () => {
    setScannedItems([]);
    setSelectedItem(null);
  };

  const handleOrderSearch = useCallback((odId, buyType, isRefundable) => {
    if (odId) {
      setSelectedOdId(odId);
      setIsOrderRefundable(isRefundable);
      localStorage.setItem("selectedOdId", odId);
      let updatedSaleType = "retail";
      if (buyType === "S") {
        updatedSaleType = "senior";
      } else if (buyType === "W") {
        updatedSaleType = "whole";
      }
      setSaleState((prev) => ({
        ...prev,
        saleType: updatedSaleType,
      }));

      setResetPayment((prev) => !prev);
    }
  }, []);

  const resetMyTable = () => {
    setScannedItems([]);
  };

  const resetSelectedOdId = useCallback(() => {
    localStorage.setItem("selectedOdId", "");
    setSelectedOdId("");
    setIsOrderRefundable(false);
    window.dispatchEvent(new Event("selectedOdIdChanged"));
  }, []);

  const resetSaleType = useCallback(() => {
    setSaleState((prev) => ({
      ...prev,
      saleType: "retail",
      seniorNo: "",
      seniorName: "",
      wholeCompanyNo: "",
      wholeCompanyName: "",
    }));
  }, []);

  const applyHoldItem = useCallback(
    (item) => {
      if (item) {
        setScannedItems(item.items);
        handleTotalSumHome(item.total);
        setHoldItems((prevHoldItems) =>
          prevHoldItems.filter((holdItem) => holdItem !== item)
        );
      }
      setHoldPopupOpen(false);
    },
    [setScannedItems, handleTotalSumHome]
  );

  const handleHold = useCallback(
    (items, total) => {
      const newHoldItem = {
        items: [...items],
        total: total,
      };
      setHoldItems((prevHoldItems) => [...prevHoldItems, newHoldItem]);
      resetScannedItems();
      resetSaleType();
    },
    [resetScannedItems, resetSaleType]
  );

  const onHoldButtonClick = useCallback(() => {
    setHoldPopupOpen(true);
  }, []);

  const getDcPrice = useCallback(
    (it) => {
      let result;
      if (saleState.saleType === "whole") {
        result = it.net_vat * ((100 - it.whole_dis_ratio) / 100);
      } else if (saleState.saleType === "senior") {
        if (it.is_senior_dc === "1") {
          const dis_ratio =
            it.senior_disc_ratio > it.retail_dis_ratio
              ? it.senior_disc_ratio
              : it.retail_dis_ratio;
          result = it.net_vat * ((100 - dis_ratio) / 100);
        } else {
          result = it.net_vat * ((100 - it.retail_dis_ratio) / 100);
        }
      } else {
        result = it.net_vat * ((100 - it.retail_dis_ratio) / 100);
      }
      return Math.round(result * 100) / 100;
    },
    [saleState.saleType]
  );

  const getVatAmount = useCallback(
    (it) => {
      let result;
      if (saleState.saleType === "whole") {
        result = it.vat * ((100 - it.whole_dis_ratio) / 100);
      } else if (saleState.saleType === "senior") {
        if (it.is_senior_dc === "1") {
          const dis_ratio =
            it.senior_disc_ratio > it.retail_dis_ratio
              ? it.senior_disc_ratio
              : it.retail_dis_ratio;
          result = it.vat * ((100 - dis_ratio) / 100);
        } else {
          result = it.vat * ((100 - it.retail_dis_ratio) / 100);
        }
      } else {
        result = it.vat * ((100 - it.retail_dis_ratio) / 100);
      }
      return Math.round(result * 100) / 100;
    },
    [saleState.saleType]
  );

  const fetchPreferenceData = async () => {
    fetch("preferences.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setPreferenceData(json);
        setBalance(json.balance);
      })
      .catch((error) => console.error("Error loading preferences:", error));
  };

  useEffect(() => {
    fetchPreferenceData();
  }, []);

  const convertSaleType = (saleType) => {
    switch (saleType) {
      case seniorValue:
        return "s";
      case wholeValue:
        return "w";
      default:
        return "c";
    }
  };

  const handlePrintData = useCallback(
    async (orderData) => {
      let printData;

      if (selectedOdId) {
        let exampt;
        exampt = orderData.reduce((acc, item) => {
          const buyerType = item.buyType.toLowerCase();
          let priceStr;

          if (buyerType === "s") {
            if (
              parseFloat(item.spp_retail_dis_ratio) >
              parseFloat(item.spp_senior_disc_ratio)
            ) {
              priceStr =
                item.spp_vat *
                ((100 - parseFloat(item.spp_retail_dis_ratio)) / 100);
            } else {
              priceStr =
                item.spp_vat *
                ((100 - parseFloat(item.spp_senior_disc_ratio)) / 100);
            }
          } else if (buyerType === "w") {
            priceStr =
              item.spp_vat *
              ((100 - parseFloat(item.spp_whole_dis_ratio)) / 100);
          } else {
            priceStr =
              item.spp_vat *
              ((100 - parseFloat(item.spp_retail_dis_ratio)) / 100);
          }
          priceStr = Math.round(priceStr * 100) / 100;

          if (parseFloat(item.spp_vat) === 0) {
            return acc + parseFloat(priceStr) * parseFloat(item.ct_qty);
          }
          return acc;
        }, 0);

        printData = {
          function: "print",

          items: orderData.map((item) => ({
            pos_invoice_no: item.pos_invoice_no,
            orderdate: item.od_time,
            // order_serial: item.od_serial_no,
            // pos_serial: item.posSerialNo,
            cashier_id: item.start_cashier_id, //todo mb_id
            cashier_name: item.start_cashier_name, //todo mb_name
            it_id: item.it_id,
            it_barcode: item.it_barcode,
            spp_vat: item.spp_vat,
            spp_purchase_price: item.spp_purchase_price,
            retail_margin_ratio: item.spp_retail_margin_ratio,
            // retail_margin: "0",
            retail_base_price: item.spp_retail_base_price,
            retail_disc_ratio: item.spp_retail_dis_ratio,
            retail_base_dc_price: item.spp_retail_dc_price,
            whole_disc_ratio: item.spp_whole_dis_ratio,
            whole_base_sale_price: item.spp_whole_sale_price,
            is_senior_dc: item.spp_is_senior_dc,
            senior_disc_ratio: item.spp_senior_disc_ratio,
            senior_base_sale_price: item.spp_senior_sale_price,
            retail_sale_price: item.spp_retail_sale_price,
            retail_sale_dc_price: item.spp_retail_sale_price,
            whole_sale_price: item.spp_whole_sale_price,
            senior_sale_price: item.spp_senior_sale_price,
            cnt: item.ct_qty,
            buyType: item.buyType,
            it_name: item.en_it_name,
          })),
          order: {
            orderNo: orderData[0].od_id,
            pos_invoice_no: orderData[0].pos_invoice_no,
            serialNo: orderData[0].od_serial_no,
            buyType: orderData[0].buyType,
            seniorNo: orderData[0].seniorNo,
            seniorName: orderData[0].od_senior_name,
            price: orderData[0].od_total_ext,
            vat: orderData[0].od_total_vat,
            cash_amount: orderData[0].cash_amount,
            card_amount: orderData[0].card_amount,
            cardnum: orderData[0].card_num,
            sum: orderData[0].od_cart_price,
            regdate: orderData[0].od_time,
            state: orderData[0].od_status,
            balance: balance,
            start_cashier_id: orderData[0].start_cashier_id,
            start_cashier_name: orderData[0].start_cashier_name,
            start_manager_id: orderData[0].start_manager_id,
            start_manager_name: orderData[0].start_manager_name,
            start_time: orderData[0].od_db_start_time,
            deposit: orderData[0].od_db_deposit,
            finish_cashier_id: orderData[0].od_db_end_cashier,
            finish_cashier_name: orderData[0].end_cashier_name,
            finish_manager_id: orderData[0].od_db_end_manager,
            finish_manager_name: orderData[0].end_manager_name,
            finish_time: orderData[0].od_db_end_time,
            change: orderData[0].od_db_changes,
            rider: orderData[0].rider,
            rider_name: orderData[0].rider_name,
            whole_sale_no: orderData[0].od_wholesale_no,
            whole_sale_name: orderData[0].od_wholesale_name,
            exampt: exampt, // 데이터에 없음
            orderer: orderData[0].orderer,
            order_mobile: orderData[0].order_mobile,
            receiver_name: orderData[0].od_b_name,
            receiver_tel: orderData[0].od_b_tel,
            receiver_addr: orderData[0].receiver_addr,
          },
        };
      }

      const jsonData = JSON.stringify(printData);

      let config = {
        method: "post",
        url: JEPETTO_API_URL,
        withCredentials: true,
        data: jsonData,
      };

      try {
        const response = await axios.request(config);
      } catch (error) {
        console.error("Error in printing order data:", error);
      }

      return printData;
    },
    [
      selectedOdId,
      saleState,
      scannedItems,
      getDcPrice,
      getVatAmount,
      preferenceData,
      loginState.loggedInMemberId,
      loginState.loggedInMemberName,
      totalState,
      balance,
      convertSaleType,
    ]
  );

  const truncateName = (name, len = 18) => {
    if (name.length > len) {
      return name.substring(0, len) + "...";
    } else {
      return name;
    }
  };

  return (
    <div className="home">
      <div className="row">
        <div className="table-header d-flex align-items-center">
          <div className="flex-grow-1">
            <button
              className="btn btn-blue btn-large"
              style={{
                backgroundColor:
                  saleState.saleType === "senior" ? "#FFF34F" : "#007bff",
                color: saleState.saleType === "senior" ? "black" : "white",
                cursor:
                  !loginState.isLogin || (selectedOdId && selectedOdId !== "")
                    ? "default"
                    : "pointer",
                opacity:
                  !loginState.isLogin || (selectedOdId && selectedOdId !== "")
                    ? 0.7
                    : 1,
              }}
              onClick={() => {
                if (
                  loginState.isLogin &&
                  (!selectedOdId || selectedOdId === "")
                ) {
                  onSeniorDiscount();
                }
              }}
            >
              Senior/PWD
              <br />
              Discount
            </button>
            <button
              className="btn m-l-4 btn-large"
              style={{
                backgroundColor:
                  saleState.saleType === "whole" ? "#FFF34F" : "#007bff",
                color: saleState.saleType === "whole" ? "black" : "white",
                cursor:
                  !loginState.isLogin || (selectedOdId && selectedOdId !== "")
                    ? "default"
                    : "pointer",
                opacity:
                  !loginState.isLogin || (selectedOdId && selectedOdId !== "")
                    ? 0.7
                    : 1,
              }}
              onClick={() => {
                if (
                  loginState.isLogin &&
                  (!selectedOdId || selectedOdId === "")
                ) {
                  onWholeSale();
                }
              }}
            >
              Whole Sale
            </button>
            <button
              className="btn btn-blue m-l-4 btn-large"
              onClick={onOrderSearch}
              style={{
                backgroundColor: selectedOdId ? "#dff9fb" : "#007bff",
                color: selectedOdId ? "black" : "white",
              }}
              disabled={!loginState.isLogin}
            >
              Order
            </button>
            <button
              className={classnames([
                "btn m-l-4 btn-large",
                delivery > 0 ? "btn-success" : "btn-primary",
              ])}
              style={{
                backgroundColor: delivery > 0 ? "#5dc460" : "#007bff",
              }}
              onClick={onDelivery}
              disabled={!loginState.isLogin}
            >
              Delivery
            </button>
            <button
              className="btn btn-blue m-l-4 btn-large"
              style={{ backgroundColor: "#007bff" }}
              onClick={onHoldButtonClick}
              disabled={!loginState.isLogin}
            >
              Hold
            </button>
            <button
              className="btn btn-blue m-l-4 btn-large"
              style={{ backgroundColor: "#007bff" }}
              onClick={onPreferences}
              disabled={!loginState.isLogin}
            >
              Preferences
            </button>
          </div>

          {saleState.saleType === "whole" && saleState.wholeCompanyName && (
            <div
              className="mr-3"
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "red",
              }}
            >
              {truncateName(saleState.wholeCompanyName, 20)}
            </div>
          )}
          {/* <div className="d-flex flex-column align-items-end">
            <div className="d-flex align-items-center">
              {loginState.isLogin &&
                loginState.loggedInMemberLevel === "10" && (
                  <button
                    className="btn btn-warning mr-3"
                    onClick={() => (window.location.href = "/tax")}
                  >
                    Tax
                  </button>
                )}
              <button className="btn btn-info" onClick={onLogin}>
                {loginState.isLogin ? "LOGOUT" : "LOGIN"}
              </button>
            </div>
            {loginState.isLogin && (
              <div className="m-t-5" style={{ fontSize: "15px" }}>
                Login: {loginState.lastLoginTime}
              </div>
            )}
          </div> */}
          <div className="d-flex flex-column align-items-end">
            <div className="d-flex align-items-center">
              {/* Always show the Tax button */}
              <button
                className="btn btn-warning mr-3"
                onClick={() => (window.location.href = "/tax")}
              >
                Tax
              </button>
              <button className="btn btn-info" onClick={onLogin}>
                {loginState.isLogin ? "LOGOUT" : "LOGIN"}
              </button>
            </div>
            {loginState.isLogin && (
              <div className="m-t-5" style={{ fontSize: "15px" }}>
                Login: {loginState.lastLoginTime}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <input
          type="text"
          ref={barcodeInputRef}
          value={itemId}
          onChange={handleBarcodeInput}
          disabled={!loginState.isLogin}
        />
      </div>
      {delivery < 1 ? (
        <div className="row" style={{ flex: 1, height: "100%" }}>
          <div className="col-xs-6" style={{ height: "100%" }}>
            <Main
              list={scannedItems}
              onSave={handleItemSave}
              onDelete={(item) => {
                setScannedItems((prev) => {
                  return prev.filter((it) => it.uuid !== item.uuid);
                });
              }}
              selectedItem={selectedItem}
              onCloseItemPopup={() => setSelectedItem(null)}
              saleType={saleState.saleType}
              sendTotalSumHome={handleTotalSumHome}
              selectedOdId={selectedOdId}
              sendTotalExtHome={handleTotalExtHome}
              sendTotalVatHome={handleTotalVatHome}
            />
          </div>
          <div className="col-xs-6" style={{ height: "100%" }}>
            <Payment
              saleType={saleState.saleType}
              totalSum={totalState.homeTotalSum}
              totalExt={totalState.homeTotalExt}
              totalVat={totalState.homeTotalVat}
              resetScannedItems={resetScannedItems}
              scannedItems={scannedItems}
              selectedOdId={selectedOdId}
              resetMyTable={resetMyTable}
              resetSelectedOdId={resetSelectedOdId}
              data={scannedItems}
              loggedInMemberName={loginState.loggedInMemberName}
              loggedInMemberId={loginState.loggedInMemberId}
              seniorNo={saleState.seniorNo}
              seniorName={saleState.seniorName}
              resetSaleType={resetSaleType}
              companyNo={saleState.wholeCompanyNo}
              companyName={saleState.wholeCompanyName}
              sendPrintDataToHome={handlePrintData}
              preferenceData={preferenceData}
              isLoggedIn={loginState.isLogin}
              resetPayment={resetPayment}
              isRefundable={isOrderRefundable}
              onHold={handleHold}
            />
          </div>
        </div>
      ) : (
        <Delivery
          members={members}
          setDelivery={setDelivery}
          loggedInMemberName={loginState.loggedInMemberName}
          loggedInMemberId={loginState.loggedInMemberId}
        />
      )}
      <SeniorDiscountPopup
        isOpen={popupState.seniorPopup}
        onClose={() =>
          setPopupState((prev) => ({ ...prev, seniorPopup: false }))
        }
        onApplyDiscount={handleSeniorDiscount}
      />
      <WholeSalePopup
        isOpen={popupState.wholePopup}
        onClose={() =>
          setPopupState((prev) => ({ ...prev, wholePopup: false }))
        }
        onApplyDiscount={handleWholeDiscount}
      />
      <OrderSearchPopup
        isOpen={popupState.orderSearchPopup}
        onClose={(odId, buyType, isRefundable) => {
          setPopupState((prev) => ({ ...prev, orderSearchPopup: false }));
          updateSelectedOdId(odId);
          handleOrderSearch(odId, buyType, isRefundable);
        }}
        members={members}
        loggedInMemberId={loginState.loggedInMemberId}
      />
      <HoldPopup
        isOpen={holdPopupOpen}
        onClose={() => setHoldPopupOpen(false)}
        holdItems={holdItems}
        onApply={applyHoldItem}
      />
      <PreferenceLoginPopup
        isOpen={popupState.preferenceLoginPopup}
        onClose={() =>
          setPopupState((prev) => ({ ...prev, preferenceLoginPopup: false }))
        }
        callback={(isAdmin) => {
          setPopupState((prev) => ({
            ...prev,
            preferencePopup: true,
            preferenceLoginPopup: false,
          }));
          setIsAdmin(isAdmin);
        }}
      />
      <PreferencePopup
        isOpen={popupState.preferencePopup}
        onClose={() =>
          setPopupState((prev) => ({ ...prev, preferencePopup: false }))
        }
        isAdmin={isAdmin}
        isLoggedIn={loginState.isLogin}
      />
      <LoginPopup
        isOpen={loginState.showLogin}
        onClose={() => toggleLoginPopup(false)}
        callback={(mb_last_login, mb_name, mb_id, mb_level, token) => {
          login({ mb_name, mb_id, mb_level }, token);
          fetchPreferenceData();
        }}
        lastLoginTime={loginState.lastLoginTime}
      />
      <ProductNotFoundPopup
        isOpen={productNotFoundPopup.isOpen}
        onClose={() => setProductNotFoundPopup({ isOpen: false, barcode: "" })}
        barcode={productNotFoundPopup.barcode}
      />
    </div>
  );
};
export default Home;
