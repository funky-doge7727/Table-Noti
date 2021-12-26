const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const db = mongoose.connection
const passport = require('passport')

const Table = require("../models/tables").model;

const seedData = require("../models/seed")

//// NOT REST COMPLIANT YET!!

// (post) seed data route

router.use(passport.authenticate('jwt', { session: false }))

router.post("/seed", async function (req, res) { 
  // Seed data for tables
    db.dropCollection("tables", () => console.log("collection dropped"))
    await Table.create(seedData, (e, m) => e ? e.message : console.log("seed data created"))
    const io = req.app.get('socketio')
    io.emit('apiCall', {apiCall: 'random'})
    res.send("seed data created")
});

// show all tables

router.post("/findall", async function (req, res) {
    const allTables = await Table.find().sort({"tableNumber": 1 })
    res.send(allTables)
})


// check for 1 table

router.post("/findone", async function (req, res) {
    const table = await Table.findOne({ tableNumber: Number(req.body.tableNumber) }).exec()
    res.send(table)
})

// create route

router.post("/createone", async function (req, res) {
    let { tableNumber, capacity } = req.body
    tableNumber = Number(tableNumber)
    capacity = Number (capacity)
    const newData = { tableNumber: tableNumber, capacity: capacity, status: "unoccupied" }
    await Table.create(newData, (e, m) => e ? e.message : console.log("new table created"))
    const io = req.app.get('socketio')
    io.emit('apiCall', {apiCall: 'random'})
    res.json(newData)
})

// update route

router.post("/updateone", async function (req, res) {
    const table = await Table.findOne({ tableNumber: Number(req.body.tableNumber) }).exec()
    table.tableNumber = req.body.tableNumber
    table.capacity = req.body.capacity
    table.status = req.body.status
    console.log(table)
    await Table.updateOne({ tableNumber: Number(req.body.tableNumber)}, table).exec()
    const io = req.app.get('socketio')
    io.emit('apiCall', {apiCall: 'random'})
    res.json(table)
})

// delete route

router.post("/deleteone", async function (req, res) {
    await Table.deleteOne({ tableNumber: Number(req.body.tableNumber) }).exec()
    const io = req.app.get('socketio')
    io.emit('apiCall', {apiCall: 'random'})
    res.json(`deleted table ${req.body.tableNumber}`)
})

// post route for status change

router.post("/changestatus", async function (req, res) {
    const table = await Table.findOne({ tableNumber: Number(req.body.tableNumber) }).exec()
    let updateTo = ''

    if (table.status === 'unoccupied') {
        if (req.body.buttonClick === true) {
            updateTo = 'awaiting party'
        } else {
            res.status(405).send('cannot change from "unoccupied" to "awaiting party" with sensor')
            return
        }
    } else if (table.status === 'awaiting party') {
        if (req.body.buttonClick === true) {
            res.status(405).send('cannot change from "awaiting party" to "occupied" with the "reserve" button. Must use IOT.')
            return
        } else {
            updateTo = 'occupied'
        }  
    } else if (table.status === 'occupied') {
        if (req.body.buttonClick === true) {
            res.status(405).send('cannot change from "occupied" to "unoccupied" with the "reserve" button. Must use IOT.')
            return
        } else {
            updateTo = 'unoccupied'
        }  
    }

    await Table.updateOne({tableNumber: Number(req.body.tableNumber)}, {status: updateTo}).exec()
    table.status = updateTo
    const io = req.app.get('socketio')
    io.emit('apiCall', {apiCall: 'random'})
    res.send(table)
})

module.exports = router;
