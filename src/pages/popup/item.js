import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useEffect, useState, useRef } from "react";
import NumberPopup from "./number";

const ItemPopup = ({ isOpen, info, onClose, onSave, onDelete, saleType }) => {
  const [item, setItem] = useState(null);
  const timerRef = useRef(null);
  const [isBowl, setIsBowl] = useState(false);

  // 타이머 리셋 함수
  const resetTimer = (duration = 1500) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onClose();
    }, duration);
  };

  // isOpen이 변경될 때마다 타이머 설정
  useEffect(() => {
    if (isOpen) {
      resetTimer();
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [isOpen]);

  // 모달 내 클릭 이벤트 리스너 추가 및 제거
  useEffect(() => {
    const handleUserActivity = () => {
      if (isOpen) {
        resetTimer();
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleUserActivity);
    }

    return () => {
      document.removeEventListener("click", handleUserActivity);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen]);

  const calculatePrice = () => {
    let result;
    if (saleType === "whole") {
      result =
        item.net_vat * ((100 - item.whole_dis_ratio) / 100) +
        item.vat * ((100 - item.whole_dis_ratio) / 100);
    } else if (saleType === "senior") {
      if (item.is_senior_dc === "1") {
        const dis_ratio =
          item.senior_disc_ratio > item.retail_dis_ratio
            ? item.senior_disc_ratio
            : item.retail_dis_ratio;
        result =
          item.net_vat * ((100 - dis_ratio) / 100) +
          item.vat * ((100 - dis_ratio) / 100);
      } else {
        result =
          item.net_vat * ((100 - item.retail_dis_ratio) / 100) +
          item.vat * ((100 - item.retail_dis_ratio) / 100);
      }
    } else {
      if (item.retail_dis_ratio !== "0") {
        result =
          item.net_vat * ((100 - item.retail_dis_ratio) / 100) +
          item.vat * ((100 - item.retail_dis_ratio) / 100);
      } else {
        result = item.retail_sale_price;
      }
    }

    return Math.round(result * 100) / 100;
  };

  const calculateDcPrice = () => {
    const price = calculatePrice();
    return Math.round(price * item.qty * 100) / 100;
  };

  useEffect(() => {
    setItem(info);
    setIsBowl(info?.isBowl || false);
  }, [info]);

  const toggleModal = (result) => {
    onClose?.(result);
  };

  const onClickBowl = () => {
    setIsBowl((prevState) => {
      const newState = !prevState;
      return newState;
    });
    resetTimer();
  };

  const handleSave = () => {
    onSave?.({ ...item, isBowl });
    resetTimer();
  };

  const handleDelete = () => {
    onDelete?.(item);
    resetTimer(); // 타이머 리셋
  };

  const handleMinus = () => {
    if (item.qty < 2) {
      return;
    }

    setItem((prev) => ({
      ...prev,
      qty: prev.qty - 1,
    }));
    resetTimer(); // 타이머 리셋
  };

  const handlePlus = () => {
    setItem((prev) => ({
      ...prev,
      qty: prev.qty + 1,
    }));
    resetTimer(); // 타이머 리셋
  };

  const [numberPopup, toggleNumberPopup] = useState({
    isOpen: false,
    data: "",
  });
  const showNumberPopup = (data) => {
    toggleNumberPopup({
      isOpen: true,
      data,
    });
    resetTimer(10000);
  };
  const hideNumberPopup = () =>
    toggleNumberPopup({
      isOpen: false,
      data: "",
    });

  if (item == null) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      size={"md"}
      toggle={toggleModal}
      fade={false}
      centered
    >
      <ModalHeader
        className="popup-title"
        toggle={toggleModal}
        close={
          <button type="button" className="close" onClick={toggleModal}>
            <span aria-hidden="true" style={{ fontSize: "24px" }}>
              &times;
            </span>
          </button>
        }
      >
        {item.name}
      </ModalHeader>
      <ModalBody>
        <div className="row">
          <div className="col-xs-12">
            <div className="d-flex item-info">
              <img
                src={`https://citymart.joshi.co.kr/data/item/${item.it_img1}`}
                className="item-thumb"
                style={{ width: "200px" }}
              />
              <div className="d-flex flex-column m-l-30">
                <h1>{item.it_en_name}</h1>
                <h2>
                  Price : ₱{calculatePrice().currencyFormat()}
                  {calculatePrice() < item.retail_sale_price && (
                    <>
                      &nbsp;(original)&nbsp;
                      <strike>
                        ₱{item.retail_sale_price.currencyFormat()}
                      </strike>
                    </>
                  )}
                </h2>
                <div className="d-flex buttons m-t-20">
                  <button
                    className="btn btn-white btn-lg f-s-20"
                    onClick={handleMinus}
                  >
                    -
                  </button>
                  <div
                    className="form-control d-flex align-items-center justify-content-center f-s-30"
                    onClick={() => showNumberPopup(item.qty)}
                  >
                    {item.qty.currencyFormat()}
                  </div>
                  <button
                    className="btn btn-white btn-lg f-s-20"
                    onClick={handlePlus}
                  >
                    +
                  </button>
                </div>
                <div className="d-flex align-items-center m-t-15">
                  <h5 className="control-label m-b-0">Price</h5>
                  <input
                    type="text"
                    className="form-control form-control-lg m-l-10"
                    readOnly
                    value={calculateDcPrice().currencyFormat() + "₱"}
                  />
                </div>
                {item?.ca_id === "40" && (
                  <div className="form-check m-t-15">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="bowlCheck"
                      checked={isBowl}
                      onClick={onClickBowl}
                    />
                    <label className="form-check-label" htmlFor="bowlCheck">
                      Hangang Noodle
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-xs-12 m-t-25">
            <div className="btn-group width-full">
              <button className="btn btn-primary btn-lg" onClick={handleSave}>
                APPLY
              </button>
              <button className="btn btn-danger btn-lg" onClick={handleDelete}>
                DEL
              </button>
              <button className="btn btn-white btn-lg" onClick={toggleModal}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
        <NumberPopup
          isOpen={numberPopup.isOpen}
          data={numberPopup.data}
          onClose={() => hideNumberPopup()}
          onApply={(value) => {
            setItem((prev) => ({
              ...prev,
              qty: value,
            }));
            hideNumberPopup();
          }}
        />
      </ModalBody>
    </Modal>
  );
};

export default ItemPopup;
