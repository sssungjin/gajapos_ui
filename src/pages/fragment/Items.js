import React from "react";

const ItemsFragment = ({ deliveryInfoData, selectedOrderId }) => {
  const filteredData = selectedOrderId
    ? deliveryInfoData.filter((item) => item.od_id === selectedOrderId)
    : [];

  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => {
      return total + item.ct_qty * item.ct_price;
    }, 0);
  };

  const totalPrice = calculateTotalPrice(filteredData);

  return (
    <div className="products table-wrapper">
      <table className="table table-td-valign-middle table-th-valign-middle table-bordered table-hover table-responsive-sm bg-white m-b-0">
        <thead className="bg-inverse text-white text-center">
          <tr>
            <th style={{ width: "8%" }}>No</th>
            <th style={{ width: "44%" }}>Item</th>
            <th style={{ width: "8%" }}>Qty</th>
            <th style={{ width: "20%" }}>Unit Price</th>
            <th style={{ width: "20%" }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-data">
                Please Select an Order.
              </td>
            </tr>
          ) : (
            filteredData.map((item, index) => (
              <tr key={index}>
                <td style={{ width: "8%" }}>{index + 1}</td>
                <td className="truncate-cell" style={{ width: "44%" }}>
                  {item.en_it_name}
                </td>
                <td style={{ width: "8%" }}>{item.ct_qty}</td>
                <td style={{ width: "20%" }}>
                  {item.ct_price.currencyFormat()}
                </td>
                <td style={{ width: "20%" }}>
                  {(item.ct_qty * item.ct_price).currencyFormat()}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-inverse text-white">
          <tr>
            <td colSpan={4} style={{ textAlign: "center" }}>
              Total
            </td>
            <td style={{ textAlign: "right" }}>
              {totalPrice.currencyFormat()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ItemsFragment;
