import React, { useState } from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import DeliveryFragment from "./fragment/Delivery";
import ItemsFragment from "./fragment/Items";
import LocationFragment from "./fragment/Location";
import dayjs from "dayjs";

const Delivery = ({ members, loggedInMemberName, loggedInMemberId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [deliveryInfoData, setDeliveryInfoData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [from, setFrom] = useState(dayjs().format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const tabs = [
    {
      tab: 0,
      title: "Delivery",
      view: () => (
        <DeliveryFragment
          members={members}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          deliveryInfoData={deliveryInfoData}
          setDeliveryInfoData={setDeliveryInfoData}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
          selectedRow={selectedRow}
          setSelectedRow={setSelectedRow}
          setSelectedOrderId={setSelectedOrderId}
          loggedInMemberName={loggedInMemberName}
          loggedInMemberId={loggedInMemberId}
        />
      ),
    },
    {
      tab: 1,
      title: "Items",
      view: () => (
        <ItemsFragment
          deliveryInfoData={deliveryInfoData}
          selectedOrderId={selectedOrderId}
        />
      ),
    },
    {
      tab: 2,
      title: "Location",
      view: () => <LocationFragment orderInfo={selectedOrder} />,
    },
  ];

  const toggleTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="delivery">
      <div className="panel panel-inverse">
        <Nav tabs className="nav-tabs-inverse">
          {tabs.map((menu) => (
            <NavItem key={menu.title}>
              <NavLink
                className={classnames({ active: activeTab === menu.tab })}
                onClick={() => toggleTab(menu.tab)}
              >
                <span className="d-none d-xs-inline">{menu.title}</span>
              </NavLink>
            </NavItem>
          ))}
        </Nav>
        <div className="panel-body">
          {tabs
            .find((it) => it.tab === activeTab)
            ?.view({
              selectedOrderId,
              setSelectedOrderId,
            })}
        </div>
      </div>
    </div>
  );
};

export default Delivery;
