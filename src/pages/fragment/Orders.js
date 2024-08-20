import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, ModalBody, Button } from "reactstrap";
import dayjs from "dayjs";
import axios from "axios";
import DateTime from "react-datetime";
import { RiFileExcel2Line } from "react-icons/ri";
import { useTable, useSortBy } from "react-table";
import api from "../../utils/api";

const TaxDc = ({ isOpen, onClose, onConfirm, currentAmount, afterAmount }) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} fade={false} size="sm" centered>
      <ModalBody>
        <div className="text-center">
          <div className="mb-3">
            <span style={{ fontSize: "24px" }}>Apply Tax DC</span>
          </div>
          <p style={{ fontSize: "16px" }}>
            Current: {currentAmount} , After about: {afterAmount}
          </p>
          <p style={{ fontSize: "16px" }}>
            Difference: {Math.round((currentAmount - afterAmount) * 100) / 100}
          </p>
          <p style={{ fontSize: "16px" }}>Is It OK?</p>
        </div>
      </ModalBody>
      <div className="d-flex justify-content-center pb-3">
        <Button color="secondary" onClick={onClose} className="mr-2">
          Cancel
        </Button>
        <Button color="primary" onClick={onConfirm}>
          OK
        </Button>
      </div>
    </Modal>
  );
};

const Orders = ({ initialSelectedDate }) => {
  const [activeOrderTab, setActiveOrderTab] = useState("before");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [discountRatio, setDiscountRatio] = useState(30);
  const [exclusiveDiscounts, setExclusiveDiscounts] = useState({
    senior: false,
    wholesale: false,
    retail: false,
    selfPurchase: false,
  });
  const [ordersData, setOrdersData] = useState([]);
  const [buyTypeFilter, setBuyTypeFilter] = useState("All");
  const [beforeTotals, setBeforeTotals] = useState({
    total: 0,
    cash: 0,
    credit: 0,
  });
  const [afterTotals, setAfterTotals] = useState({
    total: 0,
    cash: 0,
    credit: 0,
  });
  const [shouldFetchOrders, setShouldFetchOrders] = useState(false);

  const fetchOrders = useCallback(
    async (isAfter = false) => {
      const jsonData = {
        date: selectedDate,
      };

      try {
        const response = await api.post(
          isAfter ? "/tax/getOrder/isApplied" : "/tax/getOrder",
          jsonData
        );
        const orders = response.data.orders || [];
        setOrdersData(orders);
        return orders;
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersData([]); // 에러 시 빈 배열로 설정
        return [];
      }
    },
    [selectedDate]
  );

  useEffect(() => {
    if (initialSelectedDate) {
      setSelectedDate(initialSelectedDate);
      setActiveOrderTab("before");
      setShouldFetchOrders(true);
    }
  }, [initialSelectedDate]);

  useEffect(() => {
    if (shouldFetchOrders) {
      fetchOrders(activeOrderTab === "after");
      setShouldFetchOrders(false);
    }
  }, [shouldFetchOrders, activeOrderTab, fetchOrders]);

  const handleOrderTabChange = async (tab) => {
    try {
      await fetchOrders(tab === "after");
      setActiveOrderTab(tab);
    } catch (error) {
      console.error("Error changing tab:", error);
    }
  };

  const TotalsTable = () => {
    const diff = {
      total: beforeTotals.total - afterTotals.total,
      cash: beforeTotals.cash - afterTotals.cash,
      credit: beforeTotals.credit - afterTotals.credit,
    };

    const formatValue = (value) => {
      return activeOrderTab === "before" ? "-" : value.toFixed(2);
    };

    return (
      <table
        className="table table-bordered table-sm summary-table"
        style={{ width: "100%", fontSize: "16px" }}
      >
        <thead>
          <tr>
            <th style={{ fontSize: "16px", width: "25%" }}></th>
            <th style={{ fontSize: "16px", width: "25%" }}>Before</th>
            <th style={{ fontSize: "16px", width: "25%" }}>After</th>
            <th style={{ fontSize: "16px", width: "25%" }}>Difference</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontSize: "16px" }}>Total</td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {beforeTotals.total.toFixed(2)}
            </td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {formatValue(afterTotals.total)}
            </td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {formatValue(diff.total)}
            </td>
          </tr>
          <tr>
            <td style={{ fontSize: "16px" }}>Cash</td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {beforeTotals.cash.toFixed(2)}
            </td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {formatValue(afterTotals.cash)}
            </td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {formatValue(diff.cash)}
            </td>
          </tr>
          <tr>
            <td style={{ fontSize: "16px" }}>Credit</td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {beforeTotals.credit.toFixed(2)}
            </td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {formatValue(afterTotals.credit)}
            </td>
            <td style={{ fontSize: "16px", textAlign: "right" }}>
              {formatValue(diff.credit)}
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const convertBuyType = (type) => {
    switch (type) {
      case "c":
        return "Retail";
      case "w":
        return "Wholesale";
      case "s":
        return "Senior";
      default:
        return "";
    }
  };

  const onInquiry = () => {
    setShouldFetchOrders(true);
  };

  const handleExclusiveDiscountChange = (type) => {
    setExclusiveDiscounts((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredOrders = useMemo(() => {
    if (!ordersData) return []; // ordersData가 null인 경우 처리
    if (buyTypeFilter === "All") return ordersData;
    return ordersData.filter(
      (item) => convertBuyType(item.buyType) === buyTypeFilter
    );
  }, [ordersData, buyTypeFilter]);

  useEffect(() => {
    const calculateTotals = (data, onlyApplied = false) => {
      return data.reduce(
        (acc, item) => {
          if (!onlyApplied || (onlyApplied && item.is_applied)) {
            acc.total += parseFloat(item.amount || 0);
            acc.cash += parseFloat(item.od_cash_amount || 0);
            acc.credit += parseFloat(item.od_card_amount || 0);
          }
          return acc;
        },
        { total: 0, cash: 0, credit: 0 }
      );
    };

    setBeforeTotals(calculateTotals(filteredOrders));
    setAfterTotals(calculateTotals(filteredOrders, true));
  }, [activeOrderTab, filteredOrders]);

  const onApply = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    let jsonData = {
      date: selectedDate,
      discount: discountRatio,
    };

    let config = {
      method: "post",
      url: "/api2/tax/discount",
      data: jsonData,
    };

    try {
      //const response = await axios.request(config);
      const response = await api.post("/tax/discount", jsonData);
      await fetchOrders(true);
      setActiveOrderTab("after");
    } catch (error) {
      console.error("Error applying discount:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const onExcelDownload = async () => {
    try {
      // 테이블 데이터를 CSV 형식의 JSON으로 변환
      const csvData = [
        [
          "No",
          "Pos Invoice No",
          "Amount",
          "Tax",
          "VAT",
          "Cash Amount",
          "Card Amount",
          "Order Time",
          "Buy Type",
          "Tax Applied",
        ],
        ...ordersData.map((item, index) => [
          index + 1,
          item.pos_invoice_no,
          item.amount,
          item.tax,
          item.vat,
          item.od_cash_amount,
          item.od_card_amount,
          item.od_time,
          convertBuyType(item.buyType),
          activeOrderTab === "before" ? "Y" : item.is_applied ? "Y" : "N",
        ]),
      ];

      const config = {
        method: "post",
        url: "/api2/tax/csv",
        data: {
          csv_data: csvData,
          file_name: `orders_${activeOrderTab}_${selectedDate}.csv`,
        },
        responseType: "blob",
      };

      //const response = await axios.request(config);
      const response = await api.post("/tax/csv", {
        csv_data: csvData,
        file_name: `orders_${activeOrderTab}_${selectedDate}.csv`,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `orders_${activeOrderTab}_${selectedDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading Excel:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "No",
        accessor: (_, index) => index + 1,
        sortable: false,
      },
      {
        Header: "Pos Invoice No",
        accessor: "pos_invoice_no",
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: "Tax",
        accessor: "tax",
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: "VAT",
        accessor: "vat",
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: "Cash Amount",
        accessor: "od_cash_amount",
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: "Card Amount",
        accessor: "od_card_amount",
        Cell: ({ value }) => parseFloat(value).toFixed(2),
      },
      {
        Header: "Order Time",
        accessor: "od_time",
        sortable: true,
      },
      {
        Header: "Buy Type",
        accessor: "buyType",
        Cell: ({ value }) => convertBuyType(value),
        disableSortBy: true,
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: filteredOrders || [], // Add || [] here
        initialState: {
          sortBy: [
            { id: "od_time", desc: false },
            { id: "pos_invoice_no", desc: false },
            { id: "amount", desc: false },
            { id: "tax", desc: false },
            { id: "vat", desc: false },
            { id: "od_cash_amount", desc: false },
            { id: "od_card_amount", desc: false },
          ],
        },
      },
      useSortBy
    );
  return (
    <div className="tax-orders">
      <div className="orders-content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="exclusive-discount-type p-3">
            <div className="discount-type-header">
              <span>Exclusive Discount Type</span>
            </div>
            <div className="d-flex flex-wrap ml-2 mt-3">
              {Object.entries(exclusiveDiscounts).map(([key, value]) => (
                <div key={key} className="mr-2 mb-2">
                  <label className="mb-0">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleExclusiveDiscountChange(key)}
                      className="mr-1"
                      disabled
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="date-range d-flex align-items-center">
            <DateTime
              dateFormat={"YYYY-MM-DD"}
              timeFormat={false}
              value={selectedDate}
              closeOnSelect={true}
              className="custom-datetime mr-2"
              onChange={(date) =>
                setSelectedDate(date ? date.format("YYYY-MM-DD") : "")
              }
            />
            <button onClick={onInquiry} className="btn btn-primary">
              Inquiry
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className="total-amounts">
            <TotalsTable activeOrderTab={activeOrderTab} />
          </div>
          <div className="discount-ratio d-flex align-items-center">
            <label className="mr-2 mb-0">Discount Ratio: </label>
            <input
              type="number"
              value={discountRatio}
              onChange={(e) => setDiscountRatio(e.target.value)}
              className="form-control mr-2"
              style={{ width: "80px" }}
            />
            <button
              className={`btn mr-2 ${
                filteredOrders.length === 0 || activeOrderTab === "after"
                  ? "btn-secondary"
                  : "btn-primary"
              }`}
              onClick={onApply}
              disabled={
                filteredOrders.length === 0 || activeOrderTab === "after"
              }
            >
              Apply
            </button>
            <button className="btn btn-primary">Submit</button>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="order-tabs">
            <button
              className={`btn ${
                activeOrderTab === "before" ? "btn-primary" : "btn-secondary"
              } mr-2`}
              onClick={() => handleOrderTabChange("before")}
            >
              Before
            </button>
            <button
              className={`btn ${
                activeOrderTab === "after" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => handleOrderTabChange("after")}
              disabled={filteredOrders.length === 0}
            >
              After
            </button>
          </div>
          <div className="d-flex justify-content-end">
            <div className="mr-2">
              <button
                onClick={onExcelDownload}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <RiFileExcel2Line size={24} style={{ color: "green" }} />
              </button>
            </div>
            <div className="currency-unit">
              <span>Currency Unit: ₱</span>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table {...getTableProps()} className="table table-bordered">
            <thead className="thead-light sticky-header">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(
                        column.id === "buyType"
                          ? {
                              onClick: () => {
                                const nextFilter =
                                  buyTypeFilter === "All"
                                    ? "Retail"
                                    : buyTypeFilter === "Retail"
                                    ? "Wholesale"
                                    : buyTypeFilter === "Wholesale"
                                    ? "Senior"
                                    : "All";
                                setBuyTypeFilter(nextFilter);
                              },
                            }
                          : column.getSortByToggleProps()
                      )}
                      style={{ cursor: "pointer" }}
                    >
                      {column.render("Header")}
                      {column.id === "buyType" ? (
                        <span> ({buyTypeFilter})</span>
                      ) : (
                        <span style={{ whiteSpace: "pre-wrap" }}>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? "\n( ▼ )"
                              : "\n( ▲ )"
                            : "\n( - )"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    className={
                      activeOrderTab === "after" && !row.original.is_applied
                        ? "red-strikethrough"
                        : ""
                    }
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <TaxDc
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        currentAmount={beforeTotals.total.toFixed(2)}
        afterAmount={(beforeTotals.total * (1 - discountRatio / 100)).toFixed(
          2
        )}
      />
    </div>
  );
};

export default Orders;
