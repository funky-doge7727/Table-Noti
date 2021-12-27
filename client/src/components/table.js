import React from "react";
import { Row, Col } from "reactstrap";

export default props => {
  const getRow1 = _ => {
    let chairs = [];
    for (var i = 0; i < Math.ceil(props.chairs / 2); i++) {
      chairs.push(
        <span
          key={i}
          className={props.empty ? "empty-table" : props.awaiting ? "awaiting-table" : "full-table"}
        ></span>
      );
    }
    return chairs;
  };
  const getRow2 = _ => {
    let chairs2 = [];
    for (var i = 0; i < Math.floor(props.chairs / 2); i++) {
      chairs2.push(
        <span
          key={i}
          className={props.empty ? "empty-table" : props.awaiting ? "awaiting-table" : "full-table"}
        ></span>
      );
    }
    return chairs2;
  };

  return (
    <div className="table-container">
      <Col
        className={(!props.empty && props.forReserve) ? "table" :"table selectable-table"}
        onClick={_ => {
          props.empty
            ? props.selectTable(props.name, props.id)
            : !props.forReserve && props.selectTable(props.name, props.id)
        }}
      >
        <Row noGutters className="table-row">
          <Col className="text-center">{getRow1()}</Col>
        </Row>
        <Row noGutters className="table-row">
          <Col className="text-center">{getRow2()}</Col>
        </Row>

        <p className="text-center table-name">{props.name}</p>
      </Col>
    </div>
  );
};
