import React from "react";
import { Row, Col, Button } from "reactstrap";

export default _ => {
  return (
    <div>
        <Row noGutters className="text-center align-items-center pizza-cta">
            <Col>
                <h2>Modify Table</h2>
                <label for="username">Username</label>
                <input type="text" name="username"
                    onChange={() => {}}/>
                <br/>
                <label for="password">Password</label>
                <input type="password" name="password"
                    onChange={() => {}}/>
                <br/>
                <Button className="book-table-btn" onClick={ () => {}}>Login</Button>
            </Col>
        </Row>
    </div>
  );
};
