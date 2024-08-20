import React from "react";
import dayjs from "dayjs";

const LocationFragment = ({ orderInfo }) => {
  if (!orderInfo || Object.keys(orderInfo).length === 0) {
    return (
      <div className="location-no-data">
        <div className="panel panel-inverse no-data-panel">
          <div className="panel-heading">
            <h4 className="panel-title">Orderer/Receiver</h4>
          </div>
          <div className="panel-body">
            <div className="no-data-content">
              <p>Please Select an Order.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    orderer,
    order_mobile,
    orderer_addr,
    od_b_name,
    od_b_tel,
    od_b_hp,
    receiver_addr,
    od_db_start_time,
    od_db_end_time,
  } = orderInfo;

  const formatStartTime = (time) => {
    if (time === "0000-00-00 00:00:00" || !time) {
      return "Not Started";
    }
    return dayjs(time).format("YYYY-MM-DD HH:mm");
  };

  const formatEndTime = (time) => {
    if (time === "0000-00-00 00:00:00" || !time) {
      return "Not Arrived";
    }
    return dayjs(time).format("YYYY-MM-DD HH:mm");
  };

  return (
    <div className="location-fragment">
      <div className="row">
        <div className="col-xs-6">
          <div className="panel panel-inverse location-orderer border border-inverse">
            <div className="panel-heading">
              <h4 className="panel-title">Orderer</h4>
            </div>
            <div className="panel-body">
              <div className="form-group">
                <label className="control-label">Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={orderer}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="control-label">Mobile:</label>
                <input
                  type="text"
                  className="form-control"
                  value={order_mobile}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="control-label">Address:</label>
                <input
                  type="text"
                  className="form-control"
                  value={orderer_addr}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="control-label">Delivery Start:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formatStartTime(od_db_start_time)}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xs-6">
          <div className="panel panel-inverse location-receiver border border-inverse">
            <div className="panel-heading">
              <h4 className="panel-title">Receiver</h4>
            </div>
            <div className="panel-body border-inverse">
              <div className="form-group">
                <label className="control-label">Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={od_b_name}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="control-label">Mobile:</label>
                <input
                  type="text"
                  className="form-control"
                  value={od_b_hp}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="control-label">Address:</label>
                <input
                  type="text"
                  className="form-control"
                  value={receiver_addr}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="control-label">Delivery Arrival:</label>
                <input
                  type="text"
                  className="form-control"
                  value={formatEndTime(od_db_end_time)}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="control-label">Tel:</label>
                <input
                  type="text"
                  className="form-control"
                  value={od_b_tel}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationFragment;
