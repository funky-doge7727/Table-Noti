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

import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from "./table"


export default props => {
    const socketRef = useRef()
    const formRef = useRef()

    const defaultTable = {
        table: {
            name: null,
            id: null
        }
    }

    const [totalTables, setTotalTables] = useState([])
    // const [oneTable, setOneTable] = useState({}) // for editing purposes
    const [oneTableToEdit, setOneTableToEdit] = useState([])
    const [show, setShow] = useState(false)

    const oneTable = () => {
        totalTables.forEach((obj, index) => {
            if (obj.tableNumber === selection.table.name) {
                const result = [obj.tableNumber, obj.capacity, obj.status]
                // TO ASK
                console.log(result)
                setOneTableToEdit(result)
                console.log(oneTableToEdit)
                return result
            }
        })
    }

    // prompts for modals
    const [addTableSuccessful, setAddTableSuccessful] = useState(false)
    const [editTable, setEditTable] = useState(false)
    const [deleteTable, setDeleteTable] = useState(false)

    // User's selections
    const [selection, setSelection] = useState(defaultTable)

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
        let res = await fetch("http://localhost:5000/availability/findall", {
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
        console.log(totalTables)
    }

    const callOneTable = async _ => {
        let res = await fetch("http://localhost:5000/availability/findone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            },
            body: JSON.stringify(
                {tableNumber: selection.table.name}
            )
        });
        res = await res.json();
        console.log(res)
        return res.capacity
    };

    // check table availability

    useDeepCompareEffect(() => {
        socketRef.current = io.connect("http://localhost:5000")
        socketRef.current.on("apiCall", ({apiCall}) => {
            apiCallFunction()
        })
        apiCallFunction()
        return() => socketRef.current.disconnect()
    }, [totalTables]);

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

    const [editTableState, setEditTableState] = useState(0)

    // for add function
    const [addTableNumber, setAddTableNumber] = useState()
    const [tableCapacityChange, setTableCapacityChange] = useState()

    // for update function
    const [updateTableNumber, setUpdateTableNumber] = useState()
    const [updateTableCapacity, setUpdateTableCapacity] = useState()
    const [updateTableStatus, setUpdateTableStatus] = useState()

    const addTableNumberChange = (e) => {
        setAddTableNumber(e.target.value);
    }

    const addTableCapacityChange = (e) => {
        setTableCapacityChange(e.target.value);
    }

    const handleAddTable = async (e) => {
        e.preventDefault()
        let res = await fetch("http://localhost:5000/availability/createone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            },
            body: JSON.stringify(
                {tableNumber: Number(addTableNumber), capacity: Number(tableCapacityChange)}
            )
        });
        res = await res.json()
        setAddTableSuccessful(true)
        formRef.current.reset()
    }

    const handleUpdateTableNumber = (e) => {
        setUpdateTableNumber(e.target.value);
    }

    const handleUpdateTableCapacity = (e) => {
        setUpdateTableCapacity(e.target.value);
    }

    const handleUpdateTableStatus = (e) => {
        setUpdateTableStatus(e.target.value);
    }

    const handleUpdateTable = async (e) => {
        e.preventDefault()
        let res = await fetch("http://localhost:5000/availability/updateone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            },
            body: JSON.stringify(
                {tableNumber: selection.table.name, newTableNumber: Number(updateTableNumber), capacity: Number(updateTableCapacity), status: updateTableStatus}
            )
        });
        res = await res.json()
        setEditTable(false)
        formRef.current.reset()
    }

    const handleDeleteTable = async (e) => {
        e.preventDefault()
        let res = await fetch("http://localhost:5000/availability/deleteone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            },
            body: JSON.stringify(
                {
                    tableNumber: Number(selection.table.name)
                }
            )
        });
        res = await res.json()
        setDeleteTable(false)
        setSelection(defaultTable)
    }

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
                            selectTable={selectTable}/>
                    );
                }
            });
            return tables;
        }
    }

    useEffect(() => {
        oneTable()
        editTableState === 3 && selection.table.id && setDeleteTable(true)
        if (editTableState === 2 && selection.table.id) {
            setEditTable(true)
        }

    }, [selection])


    // notifications

    return (
        <div>
            <NavbarBrand className="nav-brand justify-content-center">
                Table Booking App - Table Management
            </NavbarBrand>

            <Row noGutters className="text-center align-items-center">

                <Navbar color="light" light expand="md"></Navbar>
                <Col xs="12" sm="3">
                    <Button color="none" className="booking-dropdown"
                        onClick={
                            () => props.setPage(1)
                        }
                        setPage={
                            props.setPage
                    }>
                        Reservation Menu
                    </Button>
                </Col>
                <Col xs="12" sm="3">
                    <Button color="none" className="booking-dropdown"
                        onClick={handleClickLogout}>
                        Logout
                    </Button>
                </Col>
            </Row>

            <Row noGutters className="text-center align-items-center">
                <Navbar color="light" light expand="md"></Navbar>

                <Col xs="12" sm="3">
                    <Button color="none" className="booking-dropdown" onClick= {() => setEditTableState(1)}>
                        Add Table
                    </Button>
                </Col>
                <Col xs="12" sm="3">
                    <Button color="none" className="booking-dropdown"
                        onClick={
                            () => setEditTableState(2)
                    }>
                        Edit Table
                    </Button>
                </Col>
                <Col xs="12" sm="3">
                    <Button color="none" className="booking-dropdown"
                        onClick={
                            () => setEditTableState(3)
                        }
                        setPage={
                            props.setPage
                    }>
                        Delete Table
                    </Button>
                </Col>

            </Row>

            <div> {
                editTableState === 1 && <div id="reservation-stuff">
                    <Row noGutters className="text-center align-items-center pizza-cta">
                        <Col>
                            <form ref={formRef}>
                                <h2>Fill in table details</h2>
                                <label for="tableNumber">Table Number</label>
                                <input type="text" name="tableNumber"
                                    onChange={addTableNumberChange}/>
                                <br/>
                                <label for="capacity">Capacity</label>
                                <input type="text" name="capacity"
                                    onChange={addTableCapacityChange}/>
                                <br/>
                                <Button color="none" className="book-table-btn"
                                    onClick={handleAddTable}>
                                    Add table
                                </Button>
                            </form>
                        </Col>
                    </Row>

                    <Modal show={addTableSuccessful}
                        onHide={
                            () => setAddTableSuccessful(false)
                    }>
                        <Modal.Header closeButton>
                            <Modal.Title>Add table successful</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>You have successfully added table.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary"
                                onClick={
                                    () => setAddTableSuccessful(false)
                            }>
                                Ok
                            </Button>
                        </Modal.Footer>
                    </Modal>


                </div>
            } </div>


            {
            (editTableState === 2 || editTableState === 3) && <>
                <div id="reservation-stuff">
                    <Row noGutters className="tables-display">
                        <Col> {
                            getEmptyTables() > 0 ? (
                                <p className="available-tables">
                                    {
                                    `Select tables to 
                                  ${
                                        editTableState === 2 ? 'edit' : 'delete'
                                    }`
                                } </p>
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


                <Modal show={deleteTable}
                    onHide={
                        () => setDeleteTable(false)
                }>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm delete table?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{
                        `Are you sure you want to delete table ${
                            selection.table.name
                        }?`
                    }</Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary"
                            onClick={handleDeleteTable}>
                            Yes
                        </Button>
                        <Button variant="secondary"
                            onClick={
                                () => setDeleteTable(false)
                        }>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        }

            <div id="confirm-reservation-stuff">
                
                <Modal show={editTable}
                    onHide={
                        () => setEditTable(false)
                }>
                    <Modal.Header closeButton>
                        <Modal.Title>Add table successful</Modal.Title>
                    </Modal.Header>
                    <form ref={formRef}>
                        <h2>Edit details of table below </h2>
                        <label for="tableNumber">Table Number</label>
                        <input type="text" name="tableNumber" 
                            onChange={handleUpdateTableNumber}/>
                        <br/>
                        <label for="capacity">Capacity</label>
                        <input type="text" name="capacity"
                            onChange={handleUpdateTableCapacity}/>
                        <br/>
                        <label for="status">Status</label>
                        <select name="status" onChange={handleUpdateTableStatus}>
                            <option value=""></option>
                            <option value="unoccupied">Unoccupied</option>
                            <option value="awaiting party">Awaiting Party</option>
                            <option value="occupied">Occupied</option>
                        </select>

                        <br/>
                    </form>

                    <Modal.Footer>
                        <Button variant="primary"
                            onClick={handleUpdateTable}>
                            Ok
                        </Button>
                        <Button variant="secondary"
                            onClick={
                                () => setEditTable(false)
                        }>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>

            </div>


        </div>
    );
};
