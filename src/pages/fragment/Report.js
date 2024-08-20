import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import DateTime from "react-datetime";
import dayjs from "dayjs";
import { RiFileExcel2Line } from "react-icons/ri";
import { useTable, useSortBy } from "react-table";
import api from "../../utils/api";

const Report = ({ onRowClick }) => {
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("before");

  const handleRowClick = (item) => {
    onRowClick(item.od_date);
  };

  const fetchReportData = async () => {
    let jsonData = {
      from: startDate,
      to: endDate,
    };

    let config = {
      method: "post",
      url: "/api2/tax/reports",
      data: jsonData,
    };

    try {
      //const response = await axios.request(config);
      const response = await api.post("/tax/reports", jsonData);
      setReportData(response.data.info);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const handleInquiry = () => {
    fetchReportData();
  };

  const handleSubmit = async () => {};

  const onExcelDownload = async () => {
    try {
      // 테이블 데이터를 CSV 형식의 JSON으로 변환
      const csvData = [
        [
          "No",
          "Order Date",
          "Tax DC Ratio",
          ...(activeTab === "before"
            ? [
                "Total Amount",
                "Total EXT",
                "Total VAT",
                "Total Cash Amount",
                "Total Card Amount",
              ]
            : [
                "Applied Total Amount",
                "Applied EXT",
                "Applied VAT",
                "Applied Cash Amount",
                "Applied Card Amount",
              ]),
          "Apply Time",
        ],
        ...reportData.map((item, index) => [
          index + 1,
          item.od_date,
          `${item.tax_dc_ratio}%`,
          ...(activeTab === "before"
            ? [
                item.total_amount.toFixed(2),
                item.total_ext.toFixed(2),
                item.total_vat.toFixed(2),
                item.total_cash_amount.toFixed(2),
                item.total_card_amount.toFixed(2),
              ]
            : [
                item.applied_amount.toFixed(2),
                item.applied_ext.toFixed(2),
                item.applied_vat.toFixed(2),
                item.applied_cash_amount.toFixed(2),
                item.applied_card_amount.toFixed(2),
              ]),
          item.apply_time,
        ]),
      ];

      const config = {
        method: "post",
        url: "/api2/tax/csv",
        data: {
          csv_data: csvData,
          file_name: `tax_report_${activeTab}_${startDate}_to_${endDate}.csv`,
        },
        responseType: "blob",
      };

      //const response = await axios.request(config);
      const response = await api.post("/tax/csv", {
        csv_data: csvData,
        file_name: `report_${activeTab}_${startDate}_${endDate}.csv`,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `report_${activeTab}_${startDate}_${endDate}.csv`
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

  const isDataEmpty = reportData.length === 0;

  const columns = useMemo(
    () => [
      {
        Header: "No",
        accessor: (_, index) => index + 1,
        disableSortBy: true,
      },
      {
        Header: "Order Date",
        accessor: "od_date",
      },
      {
        Header: "Tax DC Ratio",
        accessor: "tax_dc_ratio",
        Cell: ({ value }) => `${value}%`,
      },
      ...(activeTab === "before"
        ? [
            {
              Header: "Total Amount",
              accessor: "total_amount",
              Cell: ({ value }) => value.toFixed(2),
            },
            {
              Header: "Total EXT",
              accessor: "total_ext",
              Cell: ({ value }) => value.toFixed(2),
            },
            {
              Header: "Total VAT",
              accessor: "total_vat",
              Cell: ({ value }) => value.toFixed(2),
            },
            {
              Header: "Total Cash Amount",
              accessor: "total_cash_amount",
              Cell: ({ value }) => value.toFixed(2),
            },
            {
              Header: "Total Card Amount",
              accessor: "total_card_amount",
              Cell: ({ value }) => value.toFixed(2),
            },
          ]
        : [
            {
              Header: "Applied Total Amount",
              accessor: "applied_amount",
              Cell: ({ value }) => value.toFixed(2),
            },
            {
              Header: "Applied EXT",
              accessor: "applied_ext",
              Cell: ({ value }) => value.toFixed(2),
            },
            {
              Header: "Applied VAT",
              accessor: "applied_vat",
              Cell: ({ value }) => value.toFixed(2),
            },
            {
              Header: "Applied Cash Amount",
              accessor: "applied_cash_amount",
              Cell: ({ value }) => value.toFixed(2),
            },
            {
              Header: "Applied Card Amount",
              accessor: "applied_card_amount",
              Cell: ({ value }) => value.toFixed(2),
            },
          ]),
      {
        Header: "Apply Time",
        accessor: "apply_time",
      },
    ],
    [activeTab]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: reportData,
        initialState: {
          sortBy: useMemo(() => {
            return columns
              .filter((column) => column.accessor && !column.disableSortBy)
              .map((column) => ({
                id:
                  typeof column.accessor === "string"
                    ? column.accessor
                    : column.id,
                desc: false,
              }));
          }, [columns]),
        },
      },
      useSortBy
    );

  return (
    <div className="tax-report">
      <div className="report-content">
        <div className="d-flex justify-content-between align-items-center">
          <div className="date-range d-flex align-items-center">
            <DateTime
              dateFormat="YYYY-MM-DD"
              timeFormat={false}
              value={startDate}
              onChange={(date) => setStartDate(date.format("YYYY-MM-DD"))}
              inputProps={{ placeholder: "Start Date" }}
            />
            <span className="mx-2">~</span>
            <DateTime
              dateFormat="YYYY-MM-DD"
              timeFormat={false}
              value={endDate}
              onChange={(date) => setEndDate(date.format("YYYY-MM-DD"))}
              inputProps={{ placeholder: "End Date" }}
            />
            <button onClick={handleInquiry} className="btn btn-primary ml-2">
              Inquiry
            </button>
          </div>
          <div className="send-to d-flex align-items-center">
            <label className="mr-2">Send To:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter e-mail"
              className="form-control mr-2"
            />
            <button onClick={handleSubmit} className="btn btn-primary">
              Submit
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="order-tabs">
            <button
              className={`btn ${
                activeTab === "before" ? "btn-primary" : "btn-secondary"
              } mr-2`}
              onClick={() => setActiveTab("before")}
            >
              Before
            </button>
            <button
              className={`btn ${
                activeTab === "after" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setActiveTab("after")}
              disabled={isDataEmpty}
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
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={{ cursor: "pointer" }}
                    >
                      {column.render("Header")}
                      <span style={{ whiteSpace: "pre-wrap" }}>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? "\n( ▼ )"
                            : "\n( ▲ )"
                          : "\n( - )"}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row, index) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => handleRowClick(row.original)}
                    style={{ cursor: "pointer" }}
                    className={"hover-effect"}
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="text-right">
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report;
