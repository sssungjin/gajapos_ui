import React, { useState, useCallback } from "react";
import Orders from "./fragment/Orders.js";
import Report from "./fragment/Report.js";
import History from "./fragment/History.js";
import "../styles/tax.scss";

const Tax = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedDate, setSelectedDate] = useState(null);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleReportRowClick = useCallback((date) => {
    setSelectedDate(date);
    setActiveTab("orders");
  }, []);

  return (
    <div className="tax-main">
      <div className="tax">
        <div className="row">
          <div className="table-header d-flex align-items-center justify-content-between">
            <div>
              <button
                className={`btn ${
                  activeTab === "orders" ? "btn-primary" : "btn-secondary"
                } mr-2`}
                onClick={() => handleTabChange("orders")}
              >
                Orders
              </button>
              <button
                className={`btn ${
                  activeTab === "report" ? "btn-primary" : "btn-secondary"
                } mr-2`}
                onClick={() => handleTabChange("report")}
              >
                Report
              </button>
              <button
                className={`btn ${
                  activeTab === "history" ? "btn-primary" : "btn-secondary"
                }`}
                onClick={() => handleTabChange("history")}
              >
                History
              </button>
            </div>
            <div>
              <button
                className="btn btn-secondary"
                onClick={() => (window.location.href = "/")}
              >
                Home
              </button>
            </div>
          </div>
        </div>

        <div className="tax-body">
          {activeTab === "orders" && (
            <Orders initialSelectedDate={selectedDate} />
          )}
          {activeTab === "report" && (
            <Report onRowClick={handleReportRowClick} />
          )}
          {activeTab === "history" && <History />}
        </div>
      </div>
    </div>
  );
};

export default Tax;
