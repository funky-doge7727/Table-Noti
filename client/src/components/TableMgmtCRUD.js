import React, {useState, useEffect, useRef} from "react";
import io from 'socket.io-client'
import useDeepCompareEffect from 'use-deep-compare-effect'
import {
    Row,
    Col,
    Navbar,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap"

import 'bootstrap/dist/css/bootstrap.min.css';
import Table from "./Table"
import Logo from  "./Logo"

export default props => {
    const socketRef = useRef()
    const formRef = useRef()

    const backEndDomain = process.env.REACT_APP_BACK_END_DOMAIN
    const defaultTable = {
        table: {
            name: null,
            id: null,
        }
    }

    const [totalTables, setTotalTables] = useState([])
    const [oneTableToEdit, setOneTableToEdit] = useState([])

    const oneTable = async () => {
        await totalTables.forEach((obj, index) => {
            if (obj.tableNumber === selection.table.name) {
                const result = [obj.tableNumber, obj.capacity, obj.status]
                setOneTableToEdit(result)
            }
        })
    }

    // prompts for modals
    const [addTableSuccessful, setAddTableSuccessful] = useState(false)
    const [editTable, setEditTable] = useState(false)
    const [updateTableComplete, setUpdateTableComplete] = useState(false)
    const [deleteTable, setDeleteTable] = useState(false)
    const [deleteTableComplete, setDeleteTableComplete] = useState(false)
    const [duplicatedTable, setDuplicatedTable] = useState(false)

    // User's selections
    const [selection, setSelection] = useState(defaultTable)

    // Handle User Logout

    const handleClickLogout = () => {
        if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            props.setPage(0)
        }
    }

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
    }

    // check table availability

    useDeepCompareEffect(() => {
        socketRef.current = io.connect(backEndDomain)
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
    const [addTableNumber, setAddTableNumber] = useState(0)
    const [tableCapacityChange, setTableCapacityChange] = useState(0)

    // for update function
    const [updateTableNumber, setUpdateTableNumber] = useState(0)
    const [updateTableCapacity, setUpdateTableCapacity] = useState(0)
    const [updateTableStatus, setUpdateTableStatus] = useState("")

    const addTableNumberChange = (e) => {
        setAddTableNumber(e.target.value);
    }

    const addTableCapacityChange = (e) => {
        setTableCapacityChange(e.target.value);
    }

    const handleAddTable = async (e) => {
        e.preventDefault()
        let res = await fetch(`${backEndDomain}/availability/createone`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            },
            body: JSON.stringify(
                {tableNumber: addTableNumber, capacity: tableCapacityChange}
            )
        });
        if (res.ok) {
            res = await res.json()
            setAddTableSuccessful(true)
            formRef.current.reset()
        } else {
            setDuplicatedTable(true)
        }

     }

    const handleEditTableClose = async (e) => {
        setEditTable(false)
        setOneTableToEdit([])
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
        // do not run script if in add (mode 1) and delete (mode 3) mode (i.e. only run script when in edit mode)
        if (editTableState === 1 || editTableState === 3) return 
        e.preventDefault()
        let res = await fetch(`${backEndDomain}/availability/updateone`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            },
            body: JSON.stringify(
                {tableNumber: selection.table.name, newTableNumber: updateTableNumber, capacity: updateTableCapacity, status: updateTableStatus}
            )
        });
        if (res.ok) {
            res = await res.json()
            setEditTable(false)
            setOneTableToEdit([])
            formRef.current.reset()
            setUpdateTableComplete(true)
        } else {
            setDuplicatedTable(true) 
        }

    }

    const handleDeleteTable = async (e) => {
        e.preventDefault()
        await fetch(`${backEndDomain}/availability/deleteone`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${
                    localStorage.getItem('token')
                }`
            },
            body: JSON.stringify(
                {
                    tableNumber: selection.table.name
                }
            )
        });
        setDeleteTable(false)
        setSelection(defaultTable)
        setDeleteTableComplete(true)
    }

    // Generating tables from available tables state
    const getTables = _ => {
        if (totalTables) {
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
        setUpdateTableNumber(0)
        setUpdateTableCapacity(0)
        setUpdateTableStatus('')
    }, [editTable])

    useEffect(() => {
        oneTable()
        editTableState === 3 && selection.table.id && setDeleteTable(true)
        if (editTableState === 2 && selection.table.id) {
            setEditTable(true)
            // TO VERIFY
            setUpdateTableNumber(oneTableToEdit[0])
            setUpdateTableCapacity(oneTableToEdit[1])
            setUpdateTableStatus(oneTableToEdit[2])
        }

    }, [selection])

    // notifications

    return (
        <div>
            <Logo />
            <Row noGutters className="text-center align-items-center">

                <Navbar color="light" light expand="md"></Navbar>
                <Col xs="12" sm="3">
                    <Button color="none" className="button-general toggle-menu"
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
                    <Button color="none" className="button-general"
                        onClick={handleClickLogout}>
                        Logout
                    </Button>
                </Col>
            </Row>

            <Row noGutters className="text-center align-items-center">
                <Navbar color="light" light expand="md"></Navbar>

                <Col xs="12" sm="3">
                    <Button color="none" className="button-general add-table" onClick= {() => setEditTableState(1)}>
                        Add Table
                    </Button>
                </Col>
                <Col xs="12" sm="3">
                    <Button color="none" className="button-general edit-table"
                        onClick={
                            () => setEditTableState(2)
                    }>
                        Edit Table
                    </Button>
                </Col>
                <Col xs="12" sm="3">
                    <Button color="none" className="button-general"
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
                editTableState === 1 && <div>
                    <Row noGutters className="text-center form-interface">
                        <Col>
                            <form ref={formRef}>
                                <h2>Table Management - Add</h2>
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

                    <Modal isOpen={addTableSuccessful}
                        onHide={
                            () => setAddTableSuccessful(false)
                    }>
                        <ModalHeader closeButton>
                            Add table successful
                        </ModalHeader>
                        <ModalBody>You have successfully added table.</ModalBody>
                        <ModalFooter>
                            <Button variant="primary"
                                onClick={
                                    () => setAddTableSuccessful(false)
                            }>
                                Ok
                            </Button>
                        </ModalFooter>
                    </Modal>

                </div>
            } </div>


            {
            (editTableState === 2 || editTableState === 3) && <>
                <div>
                    <Row noGutters className="display-tables">
                        <Col> {
                            totalTables ? (
                                <h2 className="center-title">
                                    {
                                    `Table Management -  
                                  ${
                                        editTableState === 2 ? 'Edit' : 'Delete'
                                    }`
                                } </h2>
                            ) : null
                        }

                            {
                            totalTables ? (
                                <div>
                                    <div className="table-legend">
                                        <span className="occupied-table"></span>
                                        &nbsp; Unoccupied
                                                                                                                                                                                                                            &nbsp;&nbsp;
                                        <span className="awaiting-table"></span>
                                        &nbsp; Awaiting party
                                                                                                                                                                                                                            &nbsp;&nbsp;
                                        <span className="unoccupied-table"></span>
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


                <Modal isOpen={deleteTable}
                    onHide={
                        () => setDeleteTable(false)
                }>
                    <ModalHeader toggle={() => setDeleteTable(false)}>
                        Confirm delete table?
                    </ModalHeader>
                    <ModalBody>{
                        `Are you sure you want to delete table ${
                            selection.table.name
                        }?`
                    }</ModalBody>
                    <ModalFooter>
                        <Button className="btn-danger"
                            onClick={handleDeleteTable}>
                            Yes
                        </Button>
                        <Button
                            onClick={
                                () => setDeleteTable(false)
                        }>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={deleteTableComplete}
                        toggle={
                            () => setDeleteTableComplete(false)
                    }>
                        <ModalHeader toggle={() => setDeleteTableComplete(false)}>
                            Table deleted.
                        </ModalHeader>
                        <ModalBody>Table successfully deleted.</ModalBody>
                        <ModalFooter>
                            <Button 
                                onClick={
                                    () => setDeleteTableComplete(false)
                            }>
                                Ok
                            </Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={updateTableComplete}
                        toggle={
                            () => setUpdateTableComplete(false)
                    }>
                        <ModalHeader toggle={() => setUpdateTableComplete(false)}>
                            Table updated.
                        </ModalHeader>
                        <ModalBody>Table successfully updated.</ModalBody>
                        <ModalFooter>
                            <Button 
                                onClick={
                                    () => setUpdateTableComplete(false)
                            }>
                                Ok
                            </Button>
                        </ModalFooter>
                    </Modal>
            </>
        }

        
            <div>
                <Modal isOpen={editTable}
                    toggle={handleEditTableClose}>
                    <ModalHeader toggle={handleEditTableClose}>
                        Edit table information
                    </ModalHeader>
                    <form ref={formRef}>
                        <h3 id="edit-details-text">Edit details of existing table {selection.table.name} below </h3>
                        <br />
                        <label for="tableNumber">Table Number</label>
                        <input type="number" name="tableNumber" defaultValue={oneTableToEdit[0]}
                            required onChange={handleUpdateTableNumber}/>
                        <br/>
                        <label for="capacity">Capacity</label>
                        <input type="number" name="capacity" defaultValue={oneTableToEdit[1]}
                            required onChange={handleUpdateTableCapacity}/>
                        <br/>
                        <label for="status">Status</label>
                        <select name="status" required onChange={handleUpdateTableStatus} defaultValue={oneTableToEdit[2]}>
                            <option value="unoccupied">Unoccupied</option>
                            <option value="awaiting party">Awaiting Party</option>
                            <option value="occupied">Occupied</option>
                        </select>

                        <br/>
                    </form>

                    <ModalFooter>
                        <Button className="btn-warning"
                            onClick={handleUpdateTable}>
                            Ok
                        </Button>
                        <Button variant="secondary"
                            onClick={handleEditTableClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={duplicatedTable}
                        toggle={
                            () => setDuplicatedTable(false)
                    }>
                        <ModalHeader toggle={() => setDuplicatedTable(false)}>
                            Table already existed. 
                        </ModalHeader>
                        <ModalBody>You have keyed in an existing table number. Please choose a different one.</ModalBody>
                        <ModalFooter>
                            <Button 
                                onClick={
                                    () => setDuplicatedTable(false)
                            }>
                                Ok
                            </Button>
                        </ModalFooter>
                    </Modal>

            </div>


        </div>
    );
};
