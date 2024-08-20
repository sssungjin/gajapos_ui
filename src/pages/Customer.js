import React, { useState, useEffect } from "react";
import MyTable from "./MyTable";
import axios from "axios";
import JEPETTO_API_URL from "../utils/JepettoApiUrl";

const Customer = () => {
  const [customerItems, setCustomerItems] = useState([]);
  const [selectedOdId, setSelectedOdId] = useState("");
  const [orderData, setOrderData] = useState([]);
  const [saleType, setSaleType] = useState("retail");

  const updateCustomerItems = () => {
    const storedItems = localStorage.getItem("scannedItems");
    const storedSaleType = localStorage.getItem("saleType");
    if (storedItems) {
      setCustomerItems(JSON.parse(storedItems));
    }
    if (storedSaleType) {
      setSaleType(storedSaleType);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      updateCustomerItems();
      const storedOdId = localStorage.getItem("selectedOdId");
      setSelectedOdId(storedOdId || "");
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("selectedOdIdChanged", handleStorageChange);
    window.addEventListener("scannedItemsChanged", updateCustomerItems);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("selectedOdIdChanged", handleStorageChange);
      window.removeEventListener("scannedItemsChanged", updateCustomerItems);
    };
  }, []);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (selectedOdId !== "") {
        const jsonData = {
          function: "getorder",
          item: {
            od_status: "",
            from: "",
            to: "",
            od_id: selectedOdId,
            pos_invoice_no: "",
            //cashier_id: selectedCashier
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
          } else {
            console.error("Response data is not an array:", response.data);
            setOrderData([]);
          }
        } catch (error) {
          console.error("Error fetching order data:", error);
        }
      } else {
        setOrderData([]);
      }
    };

    fetchOrderData();
  }, [selectedOdId]);

  const dummySendTotalSum = () => {};
  const dummySendTotalExt = () => {};
  const dummySendTotalVat = () => {};

  const tableData = selectedOdId ? orderData : customerItems;

  return (
    <div className="customer">
      <MyTable
        data={tableData}
        saleType={saleType}
        sendTotalSum={dummySendTotalSum}
        sendTotalExt={dummySendTotalExt}
        sendTotalVat={dummySendTotalVat}
        selectedOdId={selectedOdId}
        onCell={() => {}}
      />
    </div>
  );
};

export default Customer;
