import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button
} from "reactstrap";

import Modal from "reactstrap/lib/Modal";

import Table from "./table";

export default props => {
  const [totalTables, setTotalTables] = useState([]);


  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  // User's selections
  const [selection, setSelection] = useState({
    table: {
      name: null,
      id: null
    },
    date: new Date(),
    time: null,
    location: "Any Location",
    size: 0
  });

  // User's booking details
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // Handle User Logout

  const handleClickLogout = () => {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      props.setPage(0)
    }
  }

  const getEmptyTables = _ => {
    // let tables = totalTables.filter(table => table.isAvailable);
    let tables = totalTables
    let count = 0
    tables.forEach(_ => _.status === "unoccupied" && count++) 
    return count;
  };

  useEffect(() => {
    // Check availability of tables from DB when a date and time is selected
      (async _ => {
        let res = await fetch("http://localhost:5000/availability/findall", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });
        res = await res.json();
        setTotalTables(res);
      })();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Make the reservation if all details are filled out
  const reserve = async _ => {
      console.log(selection)
      let res = await fetch("http://localhost:5000/availability/changestatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tableNumber: selection.table.name,
          buttonClick: true
        })
      });
      res = await res.text();
      console.log("Reserved: " + res);
      props.setPage(0);
    
  };

  // Clicking on a table sets the selection state
  const selectTable = (table_name, table_id) => {
    setSelection({
      ...selection,
      table: {
        name: table_name,
        id: table_id
      }
    });
  };


  // Generating tables from available tables state
  const getTables = _ => {
    if (getEmptyTables() > 0) {
      let tables = [];
      totalTables.forEach(table => {
        if (table.status === "unoccupied") {
          tables.push(
            <Table
              key={table._id}
              id={table._id}
              chairs={table.capacity}
              name={table.tableNumber}
              empty
              selectTable={selectTable}
            />
          ); }
         else if (table.status === "awaiting party") {
            tables.push(<Table
              key={table._id}
              id={table._id}
              chairs={table.capacity}
              name={table.tableNumber}
              awaiting
              selectTable={selectTable}
            />)
         } else {
          tables.push(
            <Table
              key={table._id}
              id={table._id}
              chairs={table.capacity}
              name={table.tableNumber}
              selectTable={selectTable}
            />
          );
        }
      });
      return tables;
    }
  };

  return (
    <div>
      <Row noGutters className="text-center align-items-center pizza-cta">
        <Col>
          <p className="looking-for-pizza">
            {!selection.table.id ? "Book a Table" : "Confirm Reservation"}

          </p>
          <p className="selected-table">
            {selection.table.id
              ? "You are going to reserve table " + selection.table.name
              : null}
          </p>

        </Col>
      </Row>

      {!selection.table.id ? (
        <div id="reservation-stuff">
          <Row noGutters className="text-center align-items-center">
            <Col xs="12" sm="3">
              <input
                type="date"
                required="required"
                className="booking-dropdown"
                value={selection.date.toISOString().split("T")[0]}
                onChange={e => {
                  if (!isNaN(new Date(new Date(e.target.value)))) {
                    let newSel = {
                      ...selection,
                      table: {
                        ...selection.table
                      },
                      date: new Date(e.target.value)
                    };
                    setSelection(newSel);
                  } else {
                    console.log("Invalid date");
                    let newSel = {
                      ...selection,
                      table: {
                        ...selection.table
                      },
                      date: new Date()
                    };
                    setSelection(newSel);
                  }
                }}
              ></input>
            </Col>
            <Col xs="12" sm="3">
              <UncontrolledDropdown>
                <DropdownToggle color="none" caret className="booking-dropdown">
                  {selection.location}
                </DropdownToggle>
                <DropdownMenu right className="booking-dropdown-menu">
                  {()=>{}}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col xs="12" sm="3">
              <UncontrolledDropdown>
                <DropdownToggle color="none" caret className="booking-dropdown">
                  {selection.size === 0
                    ? "Select a Party Size"
                    : selection.size.toString()}
                </DropdownToggle>
                <DropdownMenu right className="booking-dropdown-menu">
                  {()=>{}}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col xs="12" sm="3">
              <Button 
                color="none"
                className="booking-dropdown"
                onClick={handleClickLogout}
              >
                Logout
              </Button>
            </Col>
          </Row>
          <Row noGutters className="tables-display">
            <Col>
              {getEmptyTables() > 0 ? (
                <p className="available-tables">{getEmptyTables()} available</p>
              ) : null}

              {getEmptyTables() > 0 ? (
                  <div>
                    <div className="table-key">
                      <span className="empty-table"></span> &nbsp; Unoccupied
                      &nbsp;&nbsp;
                      <span className="awaiting-table"></span> &nbsp; Awaiting party
                      &nbsp;&nbsp;
                      <span className="full-table"></span> &nbsp; Occupied
                      &nbsp;&nbsp;
                    </div>
                    <Row noGutters>{getTables()}</Row>
                  </div>
                ) : (
                  <p className="table-display-message">No Available Tables</p>
                )
              }
            </Col>
          </Row>
        </div>
      ) : (
        <div id="confirm-reservation-stuff">
          <Row
            noGutters
            className="text-center justify-content-center reservation-details-container"
          >
          </Row>
          <Row noGutters className="text-center">
            <Col>
              <Button
                color="none"
                className="book-table-btn"
                onClick={_ => {
                  reserve();
                }}
              >
                Reserve
              </Button>
              <Button variant="primary" onClick={handleShow}> Open BootStrap </Button>
              <Modal show={false} >
                <ModalHeader>Modal Head Part</ModalHeader>
                <ModalBody>
                  Hi, React modal is here
                </ModalBody>
                <ModalFooter>
                  Close Modal
                </ModalFooter>
              </Modal>

            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};
