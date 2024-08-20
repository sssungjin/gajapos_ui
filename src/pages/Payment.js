import React, { useEffect, useState } from "react";
import NumberPopup from "./popup/number";
import ChangePopup from "./popup/change";
import dayjs from "dayjs";
import axios from "axios";
import { useBalance } from "../contexts/BalanceContext";
import MessagePopup from "./popup/message";
import JEPETTO_API_URL from "../utils/JepettoApiUrl";

const Payment = ({
  saleType,
  totalSum,
  totalExt,
  totalVat,
  resetScannedItems,
  selectedOdId,
  resetMyTable,
  resetSelectedOdId,
  data,
  loggedInMemberName,
  loggedInMemberId,
  seniorNo,
  seniorName,
  resetSaleType,
  companyNo,
  companyName,
  sendPrintDataToHome,
  preferenceData,
  isLoggedIn,
  resetPayment,
  isRefundable,
  onHold,
}) => {
  const [cash, setCash] = useState("0");
  const [cashCheck, setCashCheck] = useState(true);
  const [visa, setVisa] = useState("0");
  const [visaCheck, setVisaCheck] = useState(false);
  const [gCash, setGCash] = useState("0");
  const [gCashCheck, setGCashCheck] = useState(false);
  const [master, setMaster] = useState("0");
  const [masterCheck, setMasterCheck] = useState(false);
  const [jcb, setJcb] = useState("0");
  const [jcbCheck, setJcbCheck] = useState(false);
  const [amex, setAmex] = useState("0");
  const [amexCheck, setAmexCheck] = useState(false);
  const [debit, setDebit] = useState("0");
  const [debitCheck, setDebitCheck] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [onCredit, setOnCredit] = useState("0");
  const [onCreditCheck, setOnCreditCheck] = useState(false);
  const [message, setMessage] = useState({ isOpen: false, message: "" });

  const [input, setInput] = useState("0");
  const [cashCharge, setCashCharge] = useState("0");
  const [change, setChange] = useState("0");

  const [refundData, setRefundData] = useState({});
  const [orderData, setOrderData] = useState([]);

  const { balance, updateBalance } = useBalance();

  const [numberPopup, toggleNumberPopup] = useState({
    isOpen: false,
    data: "",
    setter: null,
    maxDigits: 16,
    isCardNumber: false,
  });

  const [changePopup, setChangePopup] = useState({
    isOpen: false,
    changeAmount: "0",
  });

  useEffect(() => {
    if (saleType !== "whole") {
      setOnCreditCheck(false);
      setOnCredit("0");
    }
  }, [saleType]);

  useEffect(() => {
    if (!selectedOdId) {
      const checkedPaymentMethods = [
        { type: "cash", isChecked: cashCheck, setValue: setCash },
        { type: "visa", isChecked: visaCheck, setValue: setVisa },
        { type: "gCash", isChecked: gCashCheck, setValue: setGCash },
        { type: "master", isChecked: masterCheck, setValue: setMaster },
        { type: "jcb", isChecked: jcbCheck, setValue: setJcb },
        { type: "amex", isChecked: amexCheck, setValue: setAmex },
        { type: "debit", isChecked: debitCheck, setValue: setDebit },
        { type: "onCredit", isChecked: onCreditCheck, setValue: setOnCredit },
      ].filter((method) => method.isChecked);

      if (checkedPaymentMethods.length === 0) {
        // 체크된 결제 방법이 없으면 아무 것도 하지 않음
        return;
      } else if (checkedPaymentMethods.length === 1) {
        // 하나만 체크되어 있으면 그곳에 전체 값을 넣음
        checkedPaymentMethods[0].setValue(totalSum.toString());
      } else {
        // 여러 개가 체크되어 있으면 cash가 체크되어 있는 경우 cash에, 아니면 첫 번째 체크된 곳에 값을 넣음
        const cashMethod = checkedPaymentMethods.find(
          (method) => method.type === "cash"
        );
        if (cashMethod) {
          cashMethod.setValue(totalSum.toString());
        } else {
          checkedPaymentMethods[0].setValue(totalSum.toString());
        }
      }

      // 체크되지 않은 결제 방법들은 0으로 초기화
      [
        setCash,
        setVisa,
        setGCash,
        setMaster,
        setJcb,
        setAmex,
        setDebit,
        setOnCredit,
      ].forEach((setter) => {
        if (
          !checkedPaymentMethods.some((method) => method.setValue === setter)
        ) {
          setter("0");
        }
      });
    }
  }, [
    totalSum,
    selectedOdId,
    cashCheck,
    visaCheck,
    gCashCheck,
    masterCheck,
    jcbCheck,
    amexCheck,
    debitCheck,
    onCreditCheck,
  ]);

  useEffect(() => {
    initializePayment();
  }, [resetPayment]);

  useEffect(() => {
    if (!selectedOdId && cashCheck) {
      const totalPayment =
        parseFloat(visa) +
        parseFloat(gCash) +
        parseFloat(master) +
        parseFloat(jcb) +
        parseFloat(amex) +
        parseFloat(debit) +
        parseFloat(onCredit);

      const updatedCash = Math.max(totalSum - totalPayment, 0).toString();
      setCash(updatedCash);
      setCashCharge(updatedCash);
    }
  }, [
    cashCheck,
    visa,
    gCash,
    master,
    jcb,
    amex,
    debit,
    onCredit,
    totalSum,
    selectedOdId,
  ]);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (selectedOdId) {
        resetMyTable();
        const jsonData = {
          function: "getorder",
          item: {
            od_status: "",
            from: "",
            to: "",
            od_id: selectedOdId,
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
            setOrderData(response.data);
            const orderData = response.data[0];

            // cash_amount 값을 cash에 표시
            setCash(orderData.cash_amount.toString());

            // card_amount 값을 card_issuer 타입에 해당하는 카드 위치에 표시
            switch (orderData.card_issuer) {
              case "GCASH":
                setGCash(orderData.card_amount.toString());
                setGCashCheck(true);
                break;
              case "VISA":
                setVisa(orderData.card_amount.toString());
                setVisaCheck(true);
                break;
              case "MASTER":
                setMaster(orderData.card_amount.toString());
                setMasterCheck(true);
                break;
              case "AMEX":
                setAmex(orderData.card_amount.toString());
                setAmexCheck(true);
                break;
              case "JCB":
                setJcb(orderData.card_amount.toString());
                setJcbCheck(true);
                break;
              case "DEBIT":
                setDebit(orderData.card_amount.toString());
                setDebitCheck(true);
                break;
              case "OnCredit":
                setOnCredit(orderData.card_amount.toString());
                setOnCreditCheck(true);
                break;

              // 기타 카드 발급사 처리 추가
              default:
                break;
            }

            // card number은 card_num 값을 할당
            setCardNum(orderData.card_num || "");

            // cash charge에는 cash_amount 값을 표시
            setCashCharge(orderData.cash_amount.toString());
          } else {
            console.error("Response data is not an array:", response.data);
          }
        } catch (error) {
          console.error("Error fetching order data:", error);
        }
      }
    };

    fetchOrderData();
  }, [selectedOdId]);

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

  const showChangePopup = (changeAmount) => {
    setChangePopup({ isOpen: true, changeAmount });
  };

  const hideChangePopup = () => {
    setChangePopup({ isOpen: false, changeAmount: "0" });
  };

  const getPaymentData = () => {
    const paymentMethods = [];
    const paymentAmounts = [];

    if (cashCheck) {
      paymentMethods.push("CASH");
      paymentAmounts.push(cash);
    }
    if (visaCheck) {
      paymentMethods.push("VISA");
      paymentAmounts.push(visa);
    }
    if (gCashCheck) {
      paymentMethods.push("GCASH");
      paymentAmounts.push(gCash);
    }
    if (masterCheck) {
      paymentMethods.push("MASTER");
      paymentAmounts.push(master);
    }
    if (jcbCheck) {
      paymentMethods.push("JCB");
      paymentAmounts.push(jcb);
    }
    if (amexCheck) {
      paymentMethods.push("AMEX");
      paymentAmounts.push(amex);
    }
    if (debitCheck) {
      paymentMethods.push("DEBIT");
      paymentAmounts.push(debit);
    }
    if (onCreditCheck) {
      paymentMethods.push("OnCredit");
      paymentAmounts.push(onCredit);
    }

    return { paymentMethods, paymentAmounts };
  };

  const handleApplyNumber = (value) => {
    if (numberPopup.isCardNumber) {
      setCardNum(value);
    } else {
      if (numberPopup.setter) {
        const setter = numberPopup.setter;
        const numValue = parseFloat(value);
        const totalSumValue = parseFloat(totalSum);

        const cardLimits = {
          gcash: parseFloat(preferenceData.gcashLimit),
          visa: parseFloat(preferenceData.visaLimit),
          master: parseFloat(preferenceData.masterLimit),
          amex: parseFloat(preferenceData.amexLimit),
          jcb: parseFloat(preferenceData.jcbLimit),
          debit: parseFloat(preferenceData.debitLimit),
        };

        const limitedValue = Math.min(numValue, totalSumValue).toString();

        const selectedCard = [
          { name: "visa", check: visaCheck, setValue: setVisa },
          { name: "gcash", check: gCashCheck, setValue: setGCash },
          { name: "master", check: masterCheck, setValue: setMaster },
          { name: "jcb", check: jcbCheck, setValue: setJcb },
          { name: "amex", check: amexCheck, setValue: setAmex },
          { name: "debit", check: debitCheck, setValue: setDebit },
          { name: "onCredit", check: onCreditCheck, setValue: setOnCredit },
        ].find((card) => card.check);

        if (setter === setCash) {
          setter(limitedValue);

          if (
            selectedCard &&
            parseFloat(limitedValue) >= cardLimits[selectedCard.name]
          ) {
            const newCardValue = Math.max(
              totalSumValue - parseFloat(limitedValue),
              0
            ).toString();
            selectedCard.setValue(newCardValue);
          }
        } else if (setter === setInput) {
          setter(value); // 여기에 input 값을 설정하는 부분 추가
          calculateChange(value);
        } else {
          if (
            selectedCard &&
            parseFloat(limitedValue) >= cardLimits[selectedCard.name]
          ) {
            setter(limitedValue);

            const newCashValue = Math.max(
              totalSumValue - parseFloat(limitedValue),
              0
            ).toString();
            setCash(newCashValue);
          }
        }
      }
    }

    hideNumberPopup();
  };

  const calculateChange = (inputValue) => {
    const inputAmount = parseFloat(inputValue);
    const cashAmount = parseFloat(cash);

    const changeAmount = inputAmount - cashAmount;
    const roundedChange = Math.round(changeAmount * 100) / 100;
    setChange(roundedChange.toString());
    showChangePopup(roundedChange.toString());
  };

  const onDone = async () => {
    if (data.length === 0 || (selectedOdId && selectedOdId !== "")) {
      setMessage({
        isOpen: true,
        message: "No items to pay or no selected order",
      });
      return;
    } else if (parseFloat(input) < parseFloat(cash)) {
      setMessage({
        isOpen: true,
        message: "Input cash is less than the required cash amount.",
      });
      return;
    } else if (
      parseFloat(cash) +
        parseFloat(visa) +
        parseFloat(gCash) +
        parseFloat(master) +
        parseFloat(jcb) +
        parseFloat(amex) +
        parseFloat(debit) +
        parseFloat(onCredit) <
      parseFloat(totalSum)
    ) {
      setMessage({
        isOpen: true,
        message: "Insufficient payment amount",
      });
      return;
    }

    if (selectedOdId) {
      setIsDisabled(false);
      initializePayment();
      resetMyTable();
      resetSelectedOdId();
      resetSaleType();
    } else {
      const buyerType = convertSaleType(saleType);

      let card = "0";
      if (visaCheck) {
        card = visa;
      } else if (gCashCheck) {
        card = gCash;
      } else if (masterCheck) {
        card = master;
      } else if (amexCheck) {
        card = amex;
      } else if (jcbCheck) {
        card = jcb;
      } else if (debitCheck) {
        card = debit;
      } else if (onCreditCheck) {
        card = onCredit;
      }

      let exampt = 0;
      const items = data.map((item) => {
        const seniorDisRatio = parseFloat(item.senior_disc_ratio);
        const retailDisRatio = parseFloat(item.retail_dis_ratio);
        let priceStr;

        if (buyerType === "s") {
          if (retailDisRatio > seniorDisRatio) {
            priceStr = item.net_vat * ((100 - item.retail_dis_ratio) / 100);
          } else {
            priceStr = item.net_vat * ((100 - item.senior_disc_ratio) / 100);
          }
        } else if (buyerType === "w") {
          priceStr = item.net_vat * ((100 - item.whole_dis_ratio) / 100);
        } else {
          priceStr = item.net_vat * ((100 - item.retail_dis_ratio) / 100);
        }
        priceStr = Math.round(priceStr * 100) / 100;

        if (parseFloat(item.vat) === 0) {
          exampt += parseFloat(priceStr) * item.qty;
        }
      });
      exampt = Math.round(exampt * 100) / 100;
      let price = Math.round((parseFloat(totalExt) - exampt) * 100) / 100;

      const newBalance = await updateBalance(Number(cash));

      const orderData = {
        function: "regist",
        items: data.map((item) => {
          const getDcPrice = (it) => {
            let result;
            if (buyerType === "w") {
              result = it.net_vat * ((100 - it.whole_dis_ratio) / 100);
            } else if (buyerType === "s") {
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
          };

          const getVatAmount = (it) => {
            let result;
            if (buyerType === "w") {
              result = it.vat * ((100 - it.whole_dis_ratio) / 100);
            } else if (buyerType === "s") {
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
          };

          const dcPrice = getDcPrice(item);
          const vatAmount = getVatAmount(item);
          const salePrice = dcPrice + vatAmount;

          return {
            pos_invoice_no: "",
            orderdate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            order_serial: "",
            pos_serial: preferenceData.serialNum,
            cashier_id: loggedInMemberId,
            cashier_name: loggedInMemberName,
            it_id: item.id,
            it_barcode: item.barcode,
            spp_vat: String(item.vat),
            spp_purchase_price: String(item.spp_purchase_price),
            retail_margin_ratio: "0",
            retail_margin: "0",
            retail_base_price: "0",
            retail_disc_ratio: String(item.retail_dis_ratio),
            retail_base_dc_price: "0",
            whole_disc_ratio: String(item.whole_dis_ratio),
            whole_base_sale_price: "0",
            is_senior_dc: item.is_senior_dc,
            senior_disc_ratio: String(item.senior_disc_ratio),
            senior_base_sale_price: "0",
            retail_sale_price: String(item.retail_sale_price),
            retail_sale_dc_price: String(salePrice),
            whole_sale_price: String(salePrice),
            senior_sale_price: String(salePrice),
            cnt: String(item.qty),
            buyType: buyerType,

            it_name: item.it_en_name,
          };
        }),
        order: {
          orderNo: "",
          pos_invoice_no: "",
          serialNo: preferenceData.serialNum,
          buyType: buyerType,
          seniorNo: seniorNo,
          seniorName: seniorName,
          price: String(price),
          vat: String(totalVat),
          cash_amount: String(cash),
          card_amount: String(card),
          cardnum: cardNum,
          sum: String(totalSum),
          regdate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          //state: "DONE",
          state: "완료",
          balance: String(newBalance),
          start_cashier_id: "",
          start_cashier_name: "",
          start_manager_id: "",
          start_manager_name: "",
          start_time: "",
          deposit: "",
          finish_cashier_id: "",
          finish_cashier_name: "",
          finish_manager_id: "",
          finish_manager_name: "",
          finish_time: "",
          change: change,
          rider: "",
          rider_name: "",
          whole_sale_no: companyNo,
          whole_sale_name: companyName,
          exampt: String(exampt),
          orderer: "",
          order_mobile: "",
          receiver_name: "",
          receiver_tel: "",
          receiver_addr: "",
          mb_id: loggedInMemberId,
        },
      };

      try {
        await updateOrderData(orderData);
      } catch (error) {
        console.error("Error during finish transaction:", error);
      }

      initializePayment();
      resetScannedItems();
      resetSaleType();
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

  const seniorValue = "senior";
  const wholeValue = "whole";

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

  const initializePayment = () => {
    setInput("0");
    setCash("0");
    setVisa("0");
    setGCash("0");
    setMaster("0");
    setJcb("0");
    setAmex("0");
    setDebit("0");
    setOnCredit("0");
    setChange("0");
    setInput("0");
    setCashCharge("0");
    setCardNum("");
    setCashCheck(true);
    setVisaCheck(false);
    setGCashCheck(false);
    setMasterCheck(false);
    setJcbCheck(false);
    setAmexCheck(false);
    setDebitCheck(false);
    setOnCreditCheck(false);
  };

  const onInitializePayment = () => {
    //setIsDisabled(false);
    resetSelectedOdId();
    initializePayment();
    localStorage.setItem("selectedOdId", "");
  };

  const onInitializeProduct = () => {
    resetScannedItems();
    resetSelectedOdId();
    resetMyTable();
    localStorage.setItem("selectedOdId", "");
  };

  const onDelivery = async () => {
    if (data.length === 0 || (selectedOdId && selectedOdId !== "")) {
      setMessage({
        isOpen: true,
        message: "No items to pay or no selected order",
      });
      return;
    } else if (parseFloat(input) < parseFloat(cash)) {
      setMessage({
        isOpen: true,
        message: "Input cash is less than the required cash amount.",
      });
      return;
    } else if (
      parseFloat(cash) +
        parseFloat(visa) +
        parseFloat(gCash) +
        parseFloat(master) +
        parseFloat(jcb) +
        parseFloat(amex) +
        parseFloat(debit) +
        parseFloat(onCredit) <
      parseFloat(totalSum)
    ) {
      setMessage({
        isOpen: true,
        message: "Insufficient payment amount",
      });
      return;
    }

    let status = "PENDING";
    let confirmMessage =
      "Do you want to proceed with the delivery order?\nWe will receive payment on site.";

    if (cardNum || parseFloat(input) > 0) {
      status = "DEPOSIT";
      confirmMessage =
        "Would you like to proceed with the delivery order?\nPre-payment has been completed.";
    }

    const isConfirmed = window.confirm(confirmMessage);

    let exampt = 0;
    const items = data.map((item) => {
      const seniorDisRatio = parseFloat(item.senior_disc_ratio);
      const retailDisRatio = parseFloat(item.retail_dis_ratio);
      let priceStr;

      if (buyerType === "s") {
        if (retailDisRatio > seniorDisRatio) {
          priceStr = item.net_vat * ((100 - item.retail_dis_ratio) / 100);
        } else {
          priceStr = item.net_vat * ((100 - item.senior_disc_ratio) / 100);
        }
      } else if (buyerType === "w") {
        priceStr = item.net_vat * ((100 - item.whole_dis_ratio) / 100);
      } else {
        priceStr = item.net_vat * ((100 - item.retail_dis_ratio) / 100);
      }
      priceStr = Math.round(priceStr * 100) / 100;

      if (parseFloat(item.vat) === 0) {
        exampt += parseFloat(priceStr) * item.qty;
      }
    });
    let price = parseFloat(totalExt) - exampt;

    updateBalance(Number(cash));

    if (isConfirmed) {
      const buyerType = convertSaleType(saleType);

      let card = "0";
      if (visaCheck) card = visa;
      else if (gCashCheck) card = gCash;
      else if (masterCheck) card = master;
      else if (amexCheck) card = amex;
      else if (jcbCheck) card = jcb;
      else if (debitCheck) card = debit;
      else if (onCreditCheck) card = onCredit;

      const orderData = {
        function: "regist",
        items: data.map((item) => ({
          pos_invoice_no: "",
          orderdate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          order_serial: "",
          pos_serial: preferenceData.serialNum,
          cashier_id: loggedInMemberId,
          cashier_name: loggedInMemberName,
          it_id: item.id,
          it_barcode: item.barcode,
          spp_vat: String(item.vat),
          spp_purchase_price: String(item.spp_purchase_price),
          retail_margin_ratio: "0",
          retail_margin: "0",
          retail_base_price: "0",
          retail_disc_ratio: String(item.retail_dis_ratio),
          retail_base_dc_price: "0",
          whole_disc_ratio: String(item.whole_dis_ratio),
          whole_base_sale_price: "0",
          is_senior_dc: item.is_senior_dc,
          senior_disc_ratio: String(item.senior_disc_ratio),
          senior_base_sale_price: "0",
          retail_sale_price: String(item.retail_sale_price),
          retail_sale_dc_price: "0",
          whole_sale_price: "0",
          senior_sale_price: "0",
          cnt: String(item.qty),
          buyType: buyerType,

          it_name: item.it_en_name,
        })),
        order: {
          orderNo: "",
          pos_invoice_no: "",
          serialNo: preferenceData.serialNum,
          buyType: buyerType,
          seniorNo: seniorNo,
          seniorName: seniorName,
          price: String(price),
          vat: String(totalVat),
          cash_amount: cash,
          card_amount: card,
          cardnum: cardNum,
          sum: String(totalSum),
          regdate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          state: status,
          balance: String(balance),
          start_cashier_id: "",
          start_cashier_name: "",
          start_manager_id: "",
          start_manager_name: "",
          start_time: "",
          deposit: "",
          finish_cashier_id: "",
          finish_cashier_name: "",
          finish_manager_id: "",
          finish_manager_name: "",
          finish_time: "",
          change: change, // ?
          rider: "",
          rider_name: "",
          whole_sale_no: companyNo,
          whole_sale_name: companyName,
          exampt: String(exampt),

          orderer: "",
          order_mobile: "",
          receiver_name: "",
          receiver_tel: "",
          receiver_addr: "",
          mb_id: loggedInMemberId,
        },
      };

      try {
        await updateOrderData(orderData);
        initializePayment();
        resetScannedItems();
        resetSaleType();
      } catch (error) {
        console.error("Error during delivery order registration:", error);
      }
    }
  };

  const onRefund = async () => {
    updateBalance(-Number(orderData[0].cash_amount));

    if (selectedOdId) {
      const refundData = {
        function: "cancel",
        order: {
          buyType: orderData[0].buyType,
          orderNo: String(orderData[0].od_id),
          pos_invoice_no: orderData[0].pos_invoice_no,
          serialNo: orderData[0].od_serial_no,
          seniorNo: orderData[0].seniorNo,
          seniorName: orderData[0].seniorName,
          price: String(orderData[0].od_total_ext),
          vat: String(orderData[0].od_total_vat),
          cash_amount: orderData[0].cash_amount,
          card_amount: orderData[0].card_amount,
          cardnum: orderData[0].card_num,
          sum: String(orderData[0].od_cart_price),
          regdate: orderData[0].od_time,
          state: "취소",
          //state: "CANCEL",
          balance: String(Number(balance) - Number(orderData[0].cash_amount)),
          start_cashier_id: orderData[0].od_db_start_cashier,
          start_cashier_name: orderData[0].od_db_start_cashier_name,
          start_manager_id: orderData[0].od_db_start_manager,
          start_manager_name: orderData[0].od_db_start_manager_name,
          start_time: orderData[0].od_db_start_time,
          deposit: orderData[0].od_db_deposit,
          finish_cashier_id: orderData[0].od_db_end_cashier,
          finish_cashier_name: orderData[0].od_db_end_cashier_name,
          finish_manager_id: orderData[0].od_db_end_manager,
          finish_manager_name: orderData[0].od_db_end_manager_name,
          finish_time: orderData[0].od_db_end_time,
          change: orderData[0].od_db_changes,
          rider: orderData[0].rider,
          rider_name: orderData[0].rider_name,
          whole_sale_no: orderData[0].od_wholesale_no,
          whole_sale_name: orderData[0].od_wholesale_name,
          exampt: orderData[0].exampt,
          orderer: orderData[0].orderer,
          order_mobile: orderData[0].order_mobile,
          receiver_name: orderData[0].receiver_name,
          receiver_tel: orderData[0].receiver_tel,
          receiver_addr: orderData[0].receiver_addr,
        },
      };

      try {
        await updateOrderData(refundData);
      } catch (error) {
        console.error("Error during refund:", error);
      }
    } else {
      return;
    }

    setIsDisabled(false);
    initializePayment();
    resetMyTable();
    resetSelectedOdId();
    resetSaleType();
  };

  const onPrint = () => {
    if (!selectedOdId) {
      setMessage({
        isOpen: true,
        message: "No items to pay or no selected order",
      });
      return;
    } else if (selectedOdId) {
      sendPrintDataToHome(orderData);
    }
  };

  const resetOtherFields = (except) => {
    if (except !== "visa") setVisa("0");
    if (except !== "gCash") setGCash("0");
    if (except !== "master") setMaster("0");
    if (except !== "jcb") setJcb("0");
    if (except !== "amex") setAmex("0");
    if (except !== "debit") setDebit("0");
    if (except !== "onCredit") {
      setOnCredit("0");
      setCardNum("");
    }
  };

  const handleCheckboxChange = (type) => {
    if (isLoggedIn) {
      switch (type) {
        case "cash":
          if (cashCheck) {
            setCashCheck(false);
            setCash("0");

            const checkedCard = [
              { check: visaCheck, setValue: setVisa },
              { check: gCashCheck, setValue: setGCash },
              { check: masterCheck, setValue: setMaster },
              { check: jcbCheck, setValue: setJcb },
              { check: amexCheck, setValue: setAmex },
              { check: debitCheck, setValue: setDebit },
              { check: onCreditCheck, setValue: setOnCredit },
            ].find((card) => card.check);

            if (checkedCard) {
              checkedCard.setValue(totalSum);
            } else {
              setVisa("0");
              setGCash("0");
              setMaster("0");
              setJcb("0");
              setAmex("0");
              setDebit("0");
              setOnCredit("0");
            }
          } else {
            setCashCheck(true);
            resetOtherFields("cash");
          }
          break;
        case "gCash":
          if (gCashCheck) {
            setGCashCheck(false);
            setGCash("0");
          } else if (!gCashCheck && !cashCheck) {
            setVisaCheck(false);
            setGCashCheck(true);
            setGCash(totalSum);
            setMasterCheck(false);
            setJcbCheck(false);
            setAmexCheck(false);
            setDebitCheck(false);
            setOnCreditCheck(false);
          } else if (cashCheck && !gCashCheck) {
            if (
              visaCheck ||
              masterCheck ||
              jcbCheck ||
              amexCheck ||
              debitCheck ||
              onCreditCheck
            ) {
              setVisaCheck(false);
              setMasterCheck(false);
              setJcbCheck(false);
              setAmexCheck(false);
              setDebitCheck(false);
              setOnCreditCheck(false);
            }
            setGCashCheck(true);
          }
          resetOtherFields("gCash");
          break;
        case "visa":
          if (visaCheck) {
            setVisaCheck(false);
            setVisa("0");
          } else if (!visaCheck && !cashCheck) {
            setVisaCheck(true);
            setVisa(totalSum);
            setGCashCheck(false);
            setMasterCheck(false);
            setJcbCheck(false);
            setAmexCheck(false);
            setDebitCheck(false);
            setOnCreditCheck(false);
          } else if (cashCheck && !visaCheck) {
            if (
              gCashCheck ||
              masterCheck ||
              jcbCheck ||
              amexCheck ||
              debitCheck ||
              onCreditCheck
            ) {
              setGCashCheck(false);
              setMasterCheck(false);
              setJcbCheck(false);
              setAmexCheck(false);
              setDebitCheck(false);
              setOnCreditCheck(false);
            }
            setVisaCheck(true);
          }
          resetOtherFields("visa");
          break;
        case "master":
          if (masterCheck) {
            setMasterCheck(false);
            setMaster("0");
          } else if (!masterCheck && !cashCheck) {
            setVisaCheck(false);
            setGCashCheck(false);
            setMasterCheck(true);
            setMaster(totalSum);
            setJcbCheck(false);
            setAmexCheck(false);
            setDebitCheck(false);
            setOnCreditCheck(false);
          } else if (cashCheck && !masterCheck) {
            if (
              visaCheck ||
              gCashCheck ||
              jcbCheck ||
              amexCheck ||
              debitCheck ||
              onCreditCheck
            ) {
              setVisaCheck(false);
              setGCashCheck(false);
              setJcbCheck(false);
              setAmexCheck(false);
              setDebitCheck(false);
              setOnCreditCheck(false);
            }
            setMasterCheck(true);
          }
          resetOtherFields("master");
          break;
        case "jcb":
          if (jcbCheck) {
            setJcbCheck(false);
            setJcb("0");
          } else if (!jcbCheck && !cashCheck) {
            setVisaCheck(false);
            setGCashCheck(false);
            setMasterCheck(false);
            setJcbCheck(true);
            setJcb(totalSum);
            setAmexCheck(false);
            setDebitCheck(false);
            setOnCreditCheck(false);
          } else if (cashCheck && !jcbCheck) {
            if (
              visaCheck ||
              gCashCheck ||
              masterCheck ||
              amexCheck ||
              debitCheck ||
              onCreditCheck
            ) {
              setVisaCheck(false);
              setGCashCheck(false);
              setMasterCheck(false);
              setAmexCheck(false);
              setDebitCheck(false);
              setOnCreditCheck(false);
            }
            setJcbCheck(true);
          }
          resetOtherFields("jcb");
          break;
        case "amex":
          if (amexCheck) {
            setAmexCheck(false);
            setAmex("0");
          } else if (!amexCheck && !cashCheck) {
            setVisaCheck(false);
            setGCashCheck(false);
            setMasterCheck(false);
            setJcbCheck(false);
            setAmexCheck(true);
            setAmex(totalSum);
            setDebitCheck(false);
            setOnCreditCheck(false);
          } else if (cashCheck && !amexCheck) {
            if (
              visaCheck ||
              gCashCheck ||
              masterCheck ||
              jcbCheck ||
              debitCheck ||
              onCreditCheck
            ) {
              setVisaCheck(false);
              setGCashCheck(false);
              setMasterCheck(false);
              setJcbCheck(false);
              setDebitCheck(false);
              setOnCreditCheck(false);
            }
            setAmexCheck(true);
          }
          resetOtherFields("amex");
          break;
        case "debit":
          if (debitCheck) {
            setDebitCheck(false);
            setDebit("0");
          } else if (!debitCheck && !cashCheck) {
            setVisaCheck(false);
            setGCashCheck(false);
            setMasterCheck(false);
            setJcbCheck(false);
            setAmexCheck(false);
            setDebitCheck(true);
            setDebit(totalSum);
            setOnCreditCheck(false);
          } else if (cashCheck && !debitCheck) {
            if (
              visaCheck ||
              gCashCheck ||
              masterCheck ||
              jcbCheck ||
              amexCheck ||
              onCreditCheck
            ) {
              setVisaCheck(false);
              setGCashCheck(false);
              setMasterCheck(false);
              setJcbCheck(false);
              setAmexCheck(false);
              setOnCreditCheck(false);
            }
            setDebitCheck(true);
          }
          resetOtherFields("debit");
          break;
        case "onCredit":
          if (onCreditCheck) {
            setOnCreditCheck(false);
            setOnCredit("0");
            setCardNum("");
          } else {
            if (
              visaCheck ||
              gCashCheck ||
              masterCheck ||
              jcbCheck ||
              amexCheck ||
              debitCheck
            ) {
              setVisaCheck(false);
              setGCashCheck(false);
              setMasterCheck(false);
              setJcbCheck(false);
              setAmexCheck(false);
              setDebitCheck(false);
            }
            setOnCreditCheck(true);
            setCardNum("0000");
          }
          resetOtherFields("onCredit");
          break;
      }
    }
  };

  const handleHold = () => {
    if (data.length > 0) {
      onHold(data, totalSum);
    }
  };

  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    setIsDisabled(selectedOdId !== "" && selectedOdId !== undefined);
  }, [selectedOdId]);

  return (
    <>
      <div className="payment">
        <div className="items-grid">
          <div className="item">
            <div
              className={`btn btn-grey d-flex justify-content-between align-items-center form-control ${
                !cashCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() => !isDisabled && handleCheckboxChange("cash")}
              style={{
                backgroundColor: cashCheck && !isDisabled ? "#b0c2f2" : "",
                color: cashCheck && !isDisabled ? "black" : "",
              }}
            >
              <input type="checkbox" checked={cashCheck} readOnly />
              CASH
            </div>
            <div
              className={`form-control ${
                !cashCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() =>
                !isDisabled && cashCheck && showNumberPopup(cash, setCash)
              }
              style={{
                backgroundColor: cashCheck && !isDisabled ? "white" : "#ced4da",
              }}
            >
              {cash.currencyFormat()}
            </div>
          </div>
          <div className="item">
            <div
              className={`btn btn-grey d-flex justify-content-between align-items-center form-control ${
                !gCashCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() => !isDisabled && handleCheckboxChange("gCash")}
              style={{
                backgroundColor: gCashCheck && !isDisabled ? "#a3ffac" : "",
                color: gCashCheck && !isDisabled ? "black" : "",
              }}
            >
              <input type="checkbox" checked={gCashCheck} readOnly />
              G-CASH
            </div>
            <div
              className={`form-control ${
                (!gCashCheck && !cashCheck) || isDisabled ? "disabled" : ""
              }`}
              onClick={() =>
                !isDisabled && gCashCheck && showNumberPopup(gCash, setGCash)
              }
              style={{
                backgroundColor:
                  gCashCheck && !isDisabled ? "white" : "#ced4da",
              }}
            >
              {gCash.currencyFormat()}
            </div>
          </div>
          <div className="item">
            <div
              className={`btn btn-grey d-flex justify-content-between align-items-center form-control ${
                !visaCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() => !isDisabled && handleCheckboxChange("visa")}
              style={{
                backgroundColor: visaCheck && !isDisabled ? "#f4fab4" : "",
                color: visaCheck && !isDisabled ? "black" : "",
              }}
            >
              <input type="checkbox" checked={visaCheck} readOnly />
              VISA
            </div>
            <div
              className={`form-control ${
                (!visaCheck && !cashCheck) || isDisabled ? "disabled" : ""
              }`}
              onClick={() =>
                !isDisabled && visaCheck && showNumberPopup(visa, setVisa)
              }
              style={{
                backgroundColor: visaCheck && !isDisabled ? "white" : "#ced4da",
              }}
            >
              {visa.currencyFormat()}
            </div>
          </div>
          <div className="item">
            <div
              className={`btn btn-grey d-flex justify-content-between align-items-center form-control ${
                !masterCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() => !isDisabled && handleCheckboxChange("master")}
              style={{
                backgroundColor: masterCheck && !isDisabled ? "#f4fab4" : "",
                color: masterCheck && !isDisabled ? "black" : "",
              }}
            >
              <input type="checkbox" checked={masterCheck} readOnly />
              MASTER
            </div>
            <div
              className={`form-control ${
                (!masterCheck && !cashCheck) || isDisabled ? "disabled" : ""
              }`}
              onClick={() =>
                !isDisabled && masterCheck && showNumberPopup(master, setMaster)
              }
              style={{
                backgroundColor:
                  masterCheck && !isDisabled ? "white" : "#ced4da",
              }}
            >
              {master.currencyFormat()}
            </div>
          </div>
          <div className="item">
            <div
              className={`btn btn-grey d-flex justify-content-between align-items-center form-control ${
                !amexCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() => !isDisabled && handleCheckboxChange("amex")}
              style={{
                backgroundColor: amexCheck && !isDisabled ? "#f4fab4" : "",
                color: amexCheck && !isDisabled ? "black" : "",
              }}
            >
              <input type="checkbox" checked={amexCheck} readOnly />
              AMERICAN EXPRESS
            </div>
            <div
              className={`form-control ${
                (!amexCheck && !cashCheck) || isDisabled ? "disabled" : "d"
              }`}
              onClick={() =>
                !isDisabled && amexCheck && showNumberPopup(amex, setAmex)
              }
              style={{
                backgroundColor: amexCheck && !isDisabled ? "white" : "#ced4da",
              }}
            >
              {amex.currencyFormat()}
            </div>
          </div>
          <div className="item">
            <div
              className={`btn btn-grey d-flex justify-content-between align-items-center form-control ${
                !jcbCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() => !isDisabled && handleCheckboxChange("jcb")}
              style={{
                backgroundColor: jcbCheck && !isDisabled ? "#f4fab4" : "",
                color: jcbCheck && !isDisabled ? "black" : "",
              }}
            >
              <input type="checkbox" checked={jcbCheck} readOnly />
              JCB
            </div>
            <div
              className={`form-control ${
                (!jcbCheck && !cashCheck) || isDisabled ? "disabled" : ""
              }`}
              onClick={() =>
                !isDisabled && jcbCheck && showNumberPopup(jcb, setJcb)
              }
              style={{
                backgroundColor: jcbCheck && !isDisabled ? "white" : "#ced4da",
              }}
            >
              {jcb.currencyFormat()}
            </div>
          </div>
          <div className="item">
            <div
              className={`btn btn-grey d-flex justify-content-between align-items-center form-control ${
                !debitCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() => !isDisabled && handleCheckboxChange("debit")}
              style={{
                backgroundColor: debitCheck && !isDisabled ? "#f4fab4" : "",
                color: debitCheck && !isDisabled ? "black" : "",
              }}
            >
              <input type="checkbox" checked={debitCheck} readOnly />
              DEBIT
            </div>
            <div
              className={`form-control ${
                (!debitCheck && !cashCheck) || isDisabled ? "disabled" : ""
              }`}
              onClick={() =>
                !isDisabled && debitCheck && showNumberPopup(debit, setDebit)
              }
              style={{
                backgroundColor:
                  debitCheck && !isDisabled ? "white" : "#ced4da",
              }}
            >
              {debit.currencyFormat()}
            </div>
          </div>
          <div className="item">
            <div
              className={`btn btn-grey d-flex justify-content-between align-items-center form-control ${
                !onCreditCheck || saleType !== "whole" || isDisabled
                  ? "disabled"
                  : ""
              }`}
              onClick={() =>
                !isDisabled &&
                saleType === "whole" &&
                handleCheckboxChange("onCredit")
              }
              style={{
                backgroundColor: onCreditCheck && !isDisabled ? "#d0bdf6" : "",
                color: onCreditCheck && !isDisabled ? "black" : "",
              }}
            >
              <input
                type="checkbox"
                checked={onCreditCheck}
                readOnly
                disabled={saleType !== "whole"}
              />
              On Credit
            </div>
            <div
              className={`form-control ${
                (!onCreditCheck && !cashCheck) ||
                saleType !== "whole" ||
                isDisabled
                  ? "disabled"
                  : ""
              }`}
              onClick={() =>
                !isDisabled &&
                onCreditCheck &&
                saleType === "whole" &&
                showNumberPopup(onCredit, setOnCredit)
              }
              style={{
                backgroundColor:
                  onCreditCheck && saleType === "whole" && !isDisabled
                    ? "white"
                    : "#ced4da",
              }}
            >
              {onCredit.currencyFormat()}
            </div>
          </div>
        </div>
        <h4>CARD Number:</h4>
        <div className="input-group">
          <div className="form-group">
            <input
              type="text"
              value={`**** - **** - **** - ${cardNum}`}
              maxLength={19}
              className="form-control"
              style={{
                fontSize: "1.2rem",
                textAlign: "center",
                backgroundColor:
                  isDisabled ||
                  !(
                    visaCheck ||
                    gCashCheck ||
                    masterCheck ||
                    jcbCheck ||
                    amexCheck ||
                    debitCheck ||
                    onCreditCheck
                  )
                    ? "#ced4da"
                    : "white",
              }}
              onClick={() =>
                !isDisabled &&
                isLoggedIn &&
                (visaCheck ||
                  gCashCheck ||
                  masterCheck ||
                  jcbCheck ||
                  amexCheck ||
                  debitCheck ||
                  onCreditCheck) &&
                showNumberPopup(cardNum.slice(-4), setCardNum, 4, true)
              }
              readOnly={
                isDisabled ||
                !(
                  visaCheck ||
                  gCashCheck ||
                  masterCheck ||
                  jcbCheck ||
                  amexCheck ||
                  debitCheck ||
                  onCreditCheck
                )
              }
            />
          </div>
        </div>
        <div className="input-group">
          <div className="form-group">
            <label className="control-label">Input Cash</label>
            <div
              className={`form-control ${
                !cashCheck || isDisabled ? "disabled" : ""
              }`}
              onClick={() =>
                !isDisabled &&
                isLoggedIn &&
                cashCheck &&
                showNumberPopup(input, setInput)
              }
              style={{
                backgroundColor: !cashCheck || isDisabled ? "#ced4da" : "white",
              }}
            >
              {input.currencyFormat()}
            </div>
          </div>
          <div className="form-group">
            <label className="control-label">Refund Cash</label>
            <div
              className={`form-control ${isDisabled ? "disabled" : ""}`}
              style={{ backgroundColor: "#ced4da" }}
              readOnly
            >
              {cashCharge.currencyFormat()}
            </div>
          </div>
        </div>
        <div className="input-group">
          <div className="form-group">
            <label className="control-label">Change</label>
            <div
              className={`form-control ${isDisabled ? "disabled" : ""}`}
              style={{ backgroundColor: "#ced4da" }}
              readOnly
            >
              {change.currencyFormat()}
            </div>
          </div>
          <div className="form-group">
            <label className="control-label">Drawer Cash</label>
            <div
              className={`form-control ${isDisabled ? "disabled" : ""}`}
              style={{ backgroundColor: "#ced4da" }}
              readOnly
            >
              {balance.currencyFormat()}
            </div>
          </div>
        </div>
        <div className="btn-group m-t">
          <button
            className="btn btn-white"
            onClick={onRefund}
            disabled={!isDisabled || !isRefundable || !isLoggedIn}
          >
            REFUND
          </button>
          <button
            className="btn btn-purple"
            onClick={onDone}
            disabled={isDisabled || !isLoggedIn}
          >
            DONE/OPEN
          </button>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-success"
            onClick={onPrint}
            disabled={!isLoggedIn || (selectedOdId === "" && data.length === 0)}
          >
            PRINT
          </button>
          <button
            className="btn btn-danger"
            style={{ width: "50%" }}
            onClick={onInitializeProduct}
            disabled={isDisabled || !isLoggedIn || selectedOdId}
          >
            Reset Items
          </button>
          <button
            className="btn btn-danger"
            style={{ width: "50%" }}
            onClick={onInitializePayment}
            disabled={isDisabled || !isLoggedIn}
          >
            Reset Payment
          </button>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-warning"
            style={{ width: "50%" }}
            onClick={onDelivery}
            disabled={isDisabled || !isLoggedIn}
          >
            Delivery
          </button>
          <button
            className="btn btn-primary"
            style={{ width: "50%" }}
            onClick={handleHold}
            disabled={isDisabled || !isLoggedIn || data.length === 0}
          >
            Hold
          </button>
        </div>
      </div>
      <NumberPopup
        isOpen={numberPopup.isOpen}
        data={numberPopup.data}
        onClose={() => hideNumberPopup()}
        onApply={(value) => handleApplyNumber(value)}
        maxDigits={numberPopup.maxDigits}
        isCardNumber={numberPopup.isCardNumber}
      />
      <ChangePopup
        isOpen={changePopup.isOpen}
        onClose={() => hideChangePopup()}
        changeAmount={changePopup.changeAmount}
      />
      <MessagePopup
        isOpen={message.isOpen}
        onClose={() => setMessage({ isOpen: false, message: "" })}
        message={message.message}
      />
    </>
  );
};

export default Payment;
