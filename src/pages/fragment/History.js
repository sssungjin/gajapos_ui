import React, { useState, useMemo } from "react";
import DateTime from "react-datetime";
import dayjs from "dayjs";
import { useTable, useSortBy } from "react-table";
import api from "../../utils/api";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );

  const fetchHistoryData = async () => {
    let jsonData = {
      from: startDate,
      to: endDate,
    };

    try {
      const response = await api.post("/tax/reports", jsonData);
      setHistoryData(response.data.info);
    } catch (error) {
      console.error("Error fetching history data:", error);
    }
  };

  const handleInquiry = () => {
    fetchHistoryData();
  };

  const columns = useMemo(
    () => [
      {
        Header: "No",
        accessor: (_, index) => index + 1,
        sortable: false,
      },
      {
        Header: "Date",
        accessor: "od_date",
        sortable: true,
        Cell: ({ value }) => dayjs(value).format("YYYY-MM-DD"),
      },
      {
        Header: "Ratio",
        accessor: "tax_dc_ratio",
        sortable: true,
        Cell: ({ value }) => `${value}%`,
      },
      {
        Header: "Total",
        accessor: "total_amount",
        sortable: true,
        Cell: ({ value }) => value.toFixed(2),
      },
      {
        Header: "Cash",
        accessor: "total_cash_amount",
        sortable: true,
        Cell: ({ value }) => value.toFixed(2),
      },
      {
        Header: "Card",
        accessor: "total_card_amount",
        sortable: true,
        Cell: ({ value }) => value.toFixed(2),
      },
      {
        Header: "Total",
        accessor: "applied_amount",
        sortable: true,
        Cell: ({ value }) => value.toFixed(2),
      },
      {
        Header: "Cash",
        accessor: "applied_cash_amount",
        sortable: true,
        Cell: ({ value }) => value.toFixed(2),
      },
      {
        Header: "Card",
        accessor: "applied_card_amount",
        sortable: true,
        Cell: ({ value }) => value.toFixed(2),
      },
      {
        Header: "Diff",
        accessor: (item) => item.total_amount - item.applied_amount,
        sortable: true,
        Cell: ({ value }) => value.toFixed(2),
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: historyData,
        initialState: {
          sortBy: columns
            .map((column) => ({
              id: column.accessor,
              desc: false,
            }))
            .filter((column) => column.id !== undefined),
        },
      },
      useSortBy
    );

  return (
    <div className="tax-history">
      <div className="history-content">
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
          <div className="d-flex justify-content-end mb-3">
            <div className="currency-unit mr-3">
              <span>Currency Unit: ₱</span>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table
            {...getTableProps()}
            className="table table-bordered history-table"
          >
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
                  <tr {...row.getRowProps()}>
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

export default History;
