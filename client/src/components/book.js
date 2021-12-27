import React, {useState, useEffect, useRef} from "react";
import io from 'socket.io-client'
import useDeepCompareEffect from 'use-deep-compare-effect'
import {
    Row,
    Col,
    Navbar,
    NavbarBrand,
    Button 
} from "reactstrap"

import {Modal} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from "./table"


export default props => {
    const socketRef = useRef()
    const [totalTables, setTotalTables] = useState([])
    const [show, setShow] = useState(false)
    const backEndDomain = process.env.REACT_APP_BACK_END_DOMAIN

    // User's selections
    const [selection, setSelection] = useState({
        table: {
            name: null,
            id: null
        }
    })

    const handleClose = () => {
      setShow(false)
      setSelection({
        table: {
            name: null,
            id: null
        }
    })
    }
    // Handle User Logout

    const handleClickLogout = () => {
        if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            props.setPage(0)
        }
    }

    const getEmptyTables = _ => { // let tables = totalTables.filter(table => table.isAvailable);
        let tables = totalTables
        let count = 0
        tables.forEach(_ => _.status === "unoccupied" && count++)
        return count;
    };

    const apiCallFunction = async _ => {
        let res = await fetch(`${backEndDomain}/availability/findall`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            }
        });
        res = await res.json();
        setTotalTables(res);
    };



    // check table availability

    useDeepCompareEffect(() => {
        socketRef.current = io.connect(backEndDomain)
        socketRef.current.on("apiCall", ({apiCall}) => {
            apiCallFunction()
        })
        apiCallFunction()
        return() => socketRef.current.disconnect()

    }, [totalTables]);

    // Make the reservation
    const reserve = async _ => {
        console.log(selection)
        let res = await fetch(`${backEndDomain}/availability/changestatus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            },
            body: JSON.stringify(
                {tableNumber: selection.table.name, buttonClick: true}
            )
        });
        res = await res.text();
        console.log("Reserved: " + res);
        setSelection({
          table: {
              name: null,
              id: null
          }
        })
        setShow(false)
    };


    // Clicking on a table sets the selection state
    const selectTable = (table_name, table_id) => {
        setSelection({
            ...selection,
            table: {
                name: table_name,
                id: table_id,
            }
        });
    };


    // Generating tables from available tables state
    const getTables = _ => {
        if (getEmptyTables() > 0) {
            let tables = [];
            totalTables.forEach(table => {
                if (table.status === "unoccupied") {
                    tables.push (
                        <Table key={
                                table._id
                            }
                            id={
                                table._id
                            }
                            chairs={
                                table.capacity
                            }
                            name={
                                table.tableNumber
                            }
                            empty
                            forReserve
                            selectTable={selectTable}/>
                    );
                } else if (table.status === "awaiting party") {
                    tables.push (
                        <Table key={
                                table._id
                            }
                            id={
                                table._id
                            }
                            chairs={
                                table.capacity
                            }
                            name={
                                table.tableNumber
                            }
                            awaiting
                            forReserve
                            selectTable={selectTable}/>
                    )
                } else {
                    tables.push (
                        <Table key={
                                table._id
                            }
                            id={
                                table._id
                            }
                            chairs={
                                table.capacity
                            }
                            name={
                                table.tableNumber
                            }
                            forReserve
                            selectTable={selectTable}/>
                    );
                }
            });
            return tables;
        }
    }

    useEffect (() => {
      selection.table.id && setShow(true)
  }, [selection])

    return (
        <div>
            <NavbarBrand className="nav-brand justify-content-center">
                Table Booking App - Reservation Menu
            </NavbarBrand>

            <Row noGutters className="text-center align-items-center">

                <Navbar color="light" light expand="md"></Navbar>
                <Col xs="12" sm="3">
                    <Button color="none" className="booking-dropdown"
                        onClick={
                            () => props.setPage(2)
                        }
                        setPage={
                            props.setPage
                    }>
                        Table Management
                    </Button>
                </Col>
                <Col xs="12" sm="3">
                    <Button color="none" className="booking-dropdown"
                        onClick={handleClickLogout}>
                        Logout
                    </Button>
                </Col>
            </Row>

                            <div id="reservation-stuff">

                    <Row noGutters className="tables-display">
                        <Col> {
                            getEmptyTables() > 0 ? (
                                <p className="available-tables">
                                    {
                                    `${getEmptyTables()} tables available`
                                }
                                     </p>
                            ) : null
                        }

                            {
                            getEmptyTables() > 0 ? (
                                <div>
                                    <div className="table-key">
                                        <span className="empty-table"></span>
                                        &nbsp; Unoccupied
                                                              &nbsp;&nbsp;
                                        <span className="awaiting-table"></span>
                                        &nbsp; Awaiting party
                                                              &nbsp;&nbsp;
                                        <span className="full-table"></span>
                                        &nbsp; Occupied
                                                              &nbsp;&nbsp;
                                    </div>
                                    <Row noGutters>
                                        {
                                        getTables()
                                    }</Row>
                                </div>
                            ) : (
                                <p className="table-display-message">No Available Tables</p>
                            )
                        } </Col>
                    </Row>
                </div>

                <div id="confirm-reservation-stuff">
                    <Modal show={show}
                        onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Reserve Table?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>You are going to reserve table {selection.table.name} </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary"
                                onClick={reserve}>
                                Reserve
                            </Button>
                            <Button variant="primary"
                                onClick={handleClose}>
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
             </div>
    );
};
