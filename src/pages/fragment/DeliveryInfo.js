import React from "react";
import dayjs from "dayjs";

const DeliveryInfo = ({ deliveryOrders, onRowSelect, selectedRow }) => {
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

  const getSettleText = (settle) => {
    switch (settle) {
      case "무통장":
        return "Cash";
      // case "카드":
      //   return "Card";
      default:
        return "Card";
    }
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = `${phone}`.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
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

  const groupedOrders = groupOrdersByOdId(deliveryOrders);

  function formatOrderNo(orderNo) {
    let orderNoStr = orderNo.toString();
    let datePart = orderNoStr.substring(0, 8);
    let uniquePart = orderNoStr.substring(8);
    let formattedOrderNo = datePart + "" + uniquePart;

    return formattedOrderNo;
  }
  return (
    <div>
      <h4>
        <u>Info</u>
      </h4>
      <div className="table-container">
        <table className="table table-td-valign-middle table-th-valign-middle table-bordered table-hover table-responsive-sm bg-white sticky-header">
          <thead className="bg-inverse text-white">
            <tr className="text-center">
              <th rowSpan={2} style={{ width: "8%" }}>
                Status
              </th>
              <th rowSpan={2} style={{ width: "30%" }}>
                Order No
              </th>
              <th rowSpan={2} style={{ width: "8%" }}>
                Price
              </th>
              <th rowSpan={2} style={{ width: "6%" }}>
                Payment Way
              </th>
              <th colSpan={2} style={{ width: "25%" }}>
                Order Info
              </th>
              <th colSpan={2} style={{ width: "25%" }}>
                Time
              </th>
            </tr>
            <tr className="text-center">
              <th style={{ width: "10%" }}>Name</th>
              <th style={{ width: "10%" }}>Phone</th>
              <th style={{ width: "12%" }}>Start</th>
              <th style={{ width: "12%" }}>Arrival</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {Array.isArray(groupedOrders) && groupedOrders.length > 0 ? (
              groupedOrders.map((order, index) => (
                <tr
                  key={order.od_id}
                  onClick={() => onRowSelect(order, index)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedRow === index ? "#d0ebff" : "transparent",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  <td>{getStatusText(order.od_status)}</td>
                  <td>
                    {formatOrderNo(order.od_id)} {order.pos_invoice_no}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {order.od_cart_price.currencyFormat()}
                  </td>
                  <td>{getSettleText(order.od_settle_case)}</td>
                  <td>{order.mb_name}</td>
                  <td>{formatPhoneNumber(order.order_mobile)}</td>
                  <td>
                    {order.od_db_start_time === "0000-00-00 00:00:00"
                      ? "Not Started"
                      : dayjs(order.od_db_start_time).format(
                          "YYYY-MM-DD HH:mm"
                        )}
                  </td>
                  <td>
                    {order.od_db_end_time === "0000-00-00 00:00:00"
                      ? "Not Arrived"
                      : dayjs(order.od_db_end_time).format("YYYY-MM-DD HH:mm")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="no-data" colSpan={8}>
                  <h4>No data available</h4>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryInfo;
