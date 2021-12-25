import React, { useState, useEffect, useRef } from "react";
import io from 'socket.io-client'
import useDeepCompareEffect from 'use-deep-compare-effect'
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
  Navbar,
  NavbarBrand,
  Button
} from "reactstrap";

import Table from "./table";



export default props => {
  const socketRef = useRef()

  // console.log(socketRef)

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

  const apiCallFunction = async _ => {
    let res = await fetch("http://localhost:5000/availability/findall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}` 
      }
    });
    res = await res.json();
    setTotalTables(res);
  };

  // check table availability

  useDeepCompareEffect(() => {
      socketRef.current = io.connect("http://localhost:5000")
      socketRef.current.on("apiCall", ({ apiCall }) => {
        apiCallFunction()
			})
      apiCallFunction()
			return () => socketRef.current.disconnect()

  }, [totalTables]);

  // Make the reservation
  const reserve = async _ => {
      console.log(selection)
      let res = await fetch("http://localhost:5000/availability/changestatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tableNumber: selection.table.name,
          buttonClick: true
        })
      });
      res = await res.text();
      console.log("Reserved: " + res);
      selection.table.id = 0
      props.setPage(1);
      window.location.reload()
  };

  const cancelReserve = () => {
    selection.table.id = 0
    console.log("Cancelled reservation: " + selection.table.name)
    props.setPage(1)
    window.location.reload()
  }

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
          <NavbarBrand className="nav-brand justify-content-center">
            Table Booking App - Reservation Menu
          </NavbarBrand>

      <Row noGutters className="text-center align-items-center pizza-cta">
        <Col>

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


            <Navbar color="light" light expand="md">

      </Navbar>
            <Col xs="12" sm="3">
                <Button 
                  color="none"
                  className="booking-dropdown"
                  onClick={() => props.setPage(2)}
                  setPage={props.setPage}
                >
                  Table Management
                </Button>
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
          <Row noGutters className="tables-display" >
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
              <Button
                color="none"
                className="book-table-btn"
                onClick={_ => {
                  cancelReserve();
                }}
              >
                Cancel
              </Button>

            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};
