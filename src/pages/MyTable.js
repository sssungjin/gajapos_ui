import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import JEPETTO_API_URL from "../utils/JepettoApiUrl";

const MyTable = React.memo(
  ({
    data = [],
    saleType = "retail",
    onCell = () => {},
    sendTotalSum = () => {},
    selectedOdId = "",
    sendTotalExt = () => {},
    sendTotalVat = () => {},
  }) => {
    const [orderData, setOrderData] = useState([]);

    useEffect(() => {
      const fetchOrderData = async () => {
        if (selectedOdId) {
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

    const calculateBowlPrice = useCallback((dcUnitPrice) => {
      const rawPrice = Math.max(130 - dcUnitPrice, 0);
      const roundedPrice = Math.round(rawPrice * 100) / 100;
      return roundedPrice;
    }, []);

    const calculateBowlDiscount = useCallback(
      (dcUnitPrice) => {
        const bowlPrice = calculateBowlPrice(dcUnitPrice);
        return Math.round(((130 - bowlPrice) / 130) * 100);
      },
      [calculateBowlPrice]
    );

    const getDcPrice = useCallback(
      (it) => {
        let result;
        if (saleType === "whole") {
          result = it.net_vat * ((100 - it.whole_dis_ratio) / 100);
        } else if (saleType === "senior") {
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
      [saleType]
    );

    const getVatAmount = useCallback(
      (it) => {
        let result;
        if (saleType === "whole") {
          result = it.vat * ((100 - it.whole_dis_ratio) / 100);
        } else if (saleType === "senior") {
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
      [saleType]
    );

    const getDisRatio = useCallback(
      (it) => {
        if (saleType === "whole") {
          return it.whole_dis_ratio;
        } else if (saleType === "senior") {
          if (it.is_senior_dc === "1") {
            return it.senior_disc_ratio > it.retail_dis_ratio
              ? it.senior_disc_ratio
              : it.retail_dis_ratio;
          } else {
            return it.retail_dis_ratio;
          }
        } else {
          return it.retail_dis_ratio;
        }
      },
      [saleType]
    );

    // ext는 부가세 적용안하고 할인만 적용한 가격
    const getExt = useCallback(
      (it) => {
        if (!it) return 0;
        return ((it.qty || 0) * Math.round(getDcPrice(it) * 100)) / 100;
      },
      [getDcPrice]
    );

    const getVat = useCallback(
      (it) => {
        if (!it) return 0;
        return ((it.qty || 0) * Math.round(getVatAmount(it) * 100)) / 100;
      },
      [getVatAmount]
    );

    // const calculateItemSum = useCallback(
    //   (it) => {
    //     if (!it) return 0;
    //     const extValue = getExt(it);
    //     const vatValue = getVat(it);
    //     return Math.round((extValue + vatValue) * 100) / 100;
    //   },
    //   [getExt, getVat]
    // );

    const calculateItemSum = useCallback(
      (it, prevItem) => {
        if (!it) return 0;
        if (it.isBowl && prevItem) {
          const bowlPrice = calculateBowlPrice(
            getDcPrice(prevItem) + getVatAmount(prevItem)
          );
          return Math.round(bowlPrice * it.qty * 100) / 100;
        }
        const extValue = getExt(it);
        const vatValue = getVat(it);
        return Math.round((extValue + vatValue) * 100) / 100;
      },
      [getExt, getVat, getDcPrice, getVatAmount, calculateBowlPrice]
    );

    // const { totalExt, totalVat, totalSum } = useMemo(() => {
    //   let newExt = 0;
    //   let newVat = 0;
    //   let newSum = 0;

    //   data.forEach((it) => {
    //     const extValue = getExt(it);
    //     const vatValue = getVat(it);
    //     newExt += extValue;
    //     newVat += vatValue;
    //     newSum += extValue + vatValue;
    //   });

    //   return {
    //     totalExt: Number(newExt.toFixed(2)),
    //     totalVat: Number(newVat.toFixed(2)),
    //     totalSum: Number(newSum.toFixed(2)),
    //   };
    // }, [data, getExt, getVat, getDcPrice, getVatAmount, calculateBowlPrice]);

    const { totalExt, totalVat, totalSum } = useMemo(() => {
      let newExt = 0;
      let newVat = 0;
      let newSum = 0;

      data.forEach((it, idx) => {
        const prevItem = idx > 0 ? data[idx - 1] : null;
        if (it.isBowl && prevItem) {
          const bowlPrice = calculateBowlPrice(
            getDcPrice(prevItem) + getVatAmount(prevItem)
          );
          const bowlTotal = bowlPrice * it.qty;
          newExt += bowlTotal;
          newSum += bowlTotal;
        } else {
          const extValue = getExt(it);
          const vatValue = getVat(it);
          newExt += extValue;
          newVat += vatValue;
          newSum += extValue + vatValue;
        }
      });

      return {
        totalExt: Math.round(newExt * 100) / 100,
        totalVat: Math.round(newVat * 100) / 100,
        totalSum: Math.round(newSum * 100) / 100,
      };
    }, [data, getExt, getVat, getDcPrice, getVatAmount, calculateBowlPrice]);

    useEffect(() => {
      sendTotalSum(totalSum);
      sendTotalExt(totalExt);
      sendTotalVat(totalVat);
    }, [totalSum]);

    const headerRef = useRef(null);
    const bodyHeaderRef = useRef(null);
    const bodyFooterRef = useRef(null);
    const footerRef = useRef(null);

    return (
      <div className="table-wrapper">
        <div className="wrapper-body">
          <table className="table table-td-valign-middle table-th-valign-middle table-bordered table-hover table-responsive-sm bg-white m-b-0 border-bottom-0">
            <thead className="bg-inverse text-white text-center">
              <tr ref={bodyHeaderRef}>
                <th style={{ width: "7%" }}>No</th>
                <th style={{ width: "20%" }}>Item</th>
                <th style={{ width: "7%" }}>Qty</th>
                <th style={{ width: "10%" }}>
                  Sale
                  <br />
                  Price
                </th>
                <th style={{ width: "9%" }}>Discount</th>
                <th style={{ width: "9%" }}>
                  DC
                  <br />
                  Unit Price
                </th>
                {/* <th style={{ width: "10%" }}>Dc Price</th> */}
                <th style={{ width: "9%" }}>Ext</th>
                <th style={{ width: "9%" }}>VAT</th>
                <th style={{ width: "10%" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {orderData.length > 0
                ? orderData.map((it, idx) => (
                    <tr key={idx} onClick={() => onCell?.(it)}>
                      <td>{idx + 1}</td>
                      <td className="truncate-cell">{it.en_it_name}</td>
                      <td>{it.ct_qty}</td>
                      <td>{it.ct_price}</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>{it.ct_price * it.ct_qty}</td>
                    </tr>
                  ))
                : data.map((it, idx) => {
                    const sale_price = it.retail_sale_price || 0;
                    const extValue = getExt(it) || 0;
                    const vatValue = getVat(it) || 0;
                    const discountRatio = getDisRatio(it) || 0;
                    const discountUnitPrice =
                      Math.round(
                        ((getDcPrice(it) || 0) + (getVatAmount(it) || 0)) * 100
                      ) / 100;

                    if (it.it_en_name === "Bowl") {
                      // Bowl 항목 렌더링
                      const parentItem = data.find(
                        (item) => item.uuid === it.parentUuid
                      );
                      const bowlDiscountUnitPrice = parentItem
                        ? Math.round(
                            ((getDcPrice(parentItem) || 0) +
                              (getVatAmount(parentItem) || 0)) *
                              100
                          ) / 100
                        : 0;

                      return (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td className="truncate-cell">{it.it_en_name}</td>
                          <td>{it.qty.toString()}</td>
                          <td>130</td>
                          <td>
                            {calculateBowlDiscount(bowlDiscountUnitPrice) + "%"}
                          </td>
                          <td>{calculateBowlPrice(bowlDiscountUnitPrice)}</td>
                          <td>
                            {calculateBowlPrice(bowlDiscountUnitPrice) * it.qty}
                          </td>
                          <td>0</td>
                          <td>
                            {calculateBowlPrice(bowlDiscountUnitPrice) * it.qty}
                          </td>
                        </tr>
                      );
                    } else {
                      // 일반 항목 렌더링
                      return (
                        <tr key={idx} onClick={() => onCell?.(it)}>
                          <td>{idx + 1}</td>
                          <td className="truncate-cell">{it.it_en_name}</td>
                          <td>{(it.qty || 0).toString()}</td>
                          <td>{sale_price}</td>
                          <td>{discountRatio + "%"}</td>
                          <td>{discountUnitPrice.toFixed(2)}</td>
                          <td>{extValue}</td>
                          <td>{vatValue}</td>
                          <td>{calculateItemSum(it) || 0}</td>
                        </tr>
                      );
                    }
                  })}
            </tbody>
          </table>
        </div>
        <div className="wrapper-footer bg-inverse" ref={footerRef}>
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ width: "54%", fontSize: "1.25rem" }}
          >
            Total
          </div>
          <div className="footer-right" style={{ width: "46%" }}>
            <div className="footer-tr">
              <div style={{ flex: 12 }}>Ext</div>
              <div style={{ flex: 12 }}>VAT</div>
              <div style={{ flex: 12 }}>SUM</div>
            </div>
            <div className="footer-tr">
              {orderData.length > 0 ? (
                <>
                  <div className="value-cell" style={{ flex: 12 }}>
                    -
                  </div>
                  <div className="value-cell" style={{ flex: 12 }}>
                    -
                  </div>
                  <div className="value-cell" style={{ flex: 12 }}>
                    {orderData[0].od_cart_price}
                  </div>
                </>
              ) : (
                <>
                  <div className="value-cell" style={{ flex: 12 }}>
                    {totalExt}
                  </div>
                  <div className="value-cell" style={{ flex: 12 }}>
                    {totalVat}
                  </div>
                  <div className="value-cell" style={{ flex: 12 }}>
                    {totalSum}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default MyTable;
