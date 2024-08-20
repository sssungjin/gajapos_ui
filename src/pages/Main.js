import React, { useState, useEffect } from "react";
import MyTable from "./MyTable";
import ItemPopup from "./popup/item";

const Main = ({
  list,
  onSave,
  onDelete,
  selectedItem,
  onCloseItemPopup,
  saleType,
  sendTotalSumHome,
  selectedOdId,
  sendTotalExtHome,
  sendTotalVatHome,
}) => {
  const [itemPopup, setItemPopup] = useState({
    isOpen: false,
    info: null,
  });

  useEffect(() => {
    if (selectedItem && !selectedOdId) {
      showItemPopup(selectedItem);
    }
  }, [selectedItem]);

  useEffect(() => {}, [saleType]);

  const showItemPopup = (info) =>
    setItemPopup({
      isOpen: true,
      info,
    });

  const hideItemPopup = () =>
    setItemPopup({
      isOpen: false,
      info: null,
    });

  const [totalSum, setTotalSum] = useState(0);
  const [totalExt, setTotalExt] = useState(0);
  const [totalVat, setTotalVat] = useState(0);

  const sendTotalSum = (sum) => {
    setTotalSum(sum);
  };

  const sendTotalExt = (ext) => {
    setTotalExt(ext);
  };

  const sendTotalVat = (vat) => {
    setTotalVat(vat);
  };

  useEffect(() => {
    sendTotalSumHome(totalSum);
    sendTotalExtHome(totalExt);
    sendTotalVatHome(totalVat);
  }, [totalSum]);

  const handleSaveItem = (updatedItem) => {
    onSave(updatedItem); // Bowl이 아닌 경우 그대로 저장
    hideItemPopup();
    onCloseItemPopup();
  };

  const handleDeleteItem = (item) => {
    const itemIndex = list.findIndex((listItem) => listItem.uuid === item.uuid);
    if (itemIndex !== -1) {
      if (item.isBowl) {
        // isBowl이 true인 경우, 해당 아이템과 다음 Bowl 아이템을 함께 삭제
        onDelete(item);
        if (
          itemIndex + 1 < list.length &&
          list[itemIndex + 1].it_en_name === "Bowl"
        ) {
          onDelete(list[itemIndex + 1]);
        }
      } else if (
        item.it_en_name === "Bowl" &&
        itemIndex > 0 &&
        list[itemIndex - 1].isBowl
      ) {
        // Bowl 아이템인 경우, 이전 아이템이 isBowl true인지 확인하고 함께 삭제
        onDelete(list[itemIndex - 1]);
        onDelete(item);
      } else {
        // 그 외의 경우 해당 아이템만 삭제
        onDelete(item);
      }
    }
    hideItemPopup();
    onCloseItemPopup();
  };

  return (
    <div className="main">
      <MyTable
        data={list}
        onCell={(item) => !selectedOdId && showItemPopup(item)}
        saleType={saleType}
        sendTotalSum={sendTotalSum}
        selectedOdId={selectedOdId}
        sendTotalExt={sendTotalExt}
        sendTotalVat={sendTotalVat}
      />

      <ItemPopup
        isOpen={itemPopup.isOpen}
        info={itemPopup.info}
        onClose={() => {
          hideItemPopup();
          onCloseItemPopup();
        }}
        // onSave={(updatedItem) => {
        //   onSave(updatedItem);
        //   hideItemPopup();
        //   onCloseItemPopup();
        // }}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        saleType={saleType}
      />
    </div>
  );
};

export default Main;
