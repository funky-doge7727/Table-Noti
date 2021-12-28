# Table Booking App

Access the Web Application here: ([to be updated])

A table booking app for storefront staff to book tables for customers. App also detects whether a table has been occupied or unoccupied by "IOT" technology.

## Main Tech Stack

The application was developed using the following tech stack:

- MongoDB
- ExpressJS
- ReactJS
- NodeJS
- JWT Authentication
- Socket.io

# Logic of app operation

- A default table status is "unoccupied" when there are no customers occupied at the table.

## Dashboard page
- When customers visit the restaurant, the storefront staff will bring them into the store and bring them to their table. 
- Prior to bringing the customers to their tables, the storefront staff needs to reserve the table by changing a specific table's status from "unoccupied" to "awaiting party".
- Once the customers have settled down at their tables, the table status will automatically update to “Occupied” by way of "IOT" sensor (currently simulated by PostMan's POST request).
- Once the customers have finished the food and the tables have been cleared, the status of the tables will be reset to "Unoccupied" by way of "IOT" sensor.
- For the avoidance of doubt, status changes that require "IOT" sensors cannot be directly changed from the app's table reservation function. To do a backend manual adjustment on the said statuses, the storefront staff will have to launch the "table management" page and edit the status as elaborated in the section below. 

## Table Management page
- Storefront staff can (1) add, (2) delete and (3) edit tables as required with the table management page.
- Tables are labelled by table number. When adding or editing tables, the storefront staff needs to note that each table number is unique (i.e. there can be no 2 or more tables of the same table number).

# Structure of Web Application

The key features of the application are as follow:

- Dashboard page: Shows the current statuses of all tables (Can be in tabular form)
- Real-time updates - When a table changed its status, the new status will be reflected immediately without the need to refresh the page
- Interactivity - Multiple users can use the same web user interface, all users should see the table status changes in real-time as well
- Tables management page - CRUD feature to create, read, update and delete tables
- User Verification - For safety purposes, only logged in users can view the web user interface

Credits to https://github.com/athoutam1/Restaurant-Reservation for the base code reference.