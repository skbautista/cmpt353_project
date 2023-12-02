const userdb = require("./api/usersdb");

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

//connections for express
const port = 8080;
const host = '0.0.0.0';
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use('/', express.static(path.join(__dirname, 'public')));


//Connection for mysql
var dbName = "projectdb";
var userTable = "users";

const conn = mysql.createConnection({
    host: "database",
    user: "root",
    password: "admin",
    port: 3306
});

conn.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected");
});

/* --------------------- DATABASE ---------------------*/
let createDB = `CREATE DATABASE IF NOT EXISTS ${dbName}`;
let getDatabase = `USE ${dbName}`;
let addUsrTable = `CREATE TABLE IF NOT EXISTS ${userTable} (
            id          int unsigned NOT NULL auto_increment,
            userName       varchar(100) NOT NULL,
            passWord        varchar(100) NOT NULL,
            PRIMARY KEY (id))`;
conn.query(createDB, (err) => {
    if(err){
        throw `Server cannot create a database.`;
    }
    console.log(`[SERVER] : database \'${dbName}\' created.`);
});
conn.query(getDatabase, (err) => {
    if(err){
        throw `Server cannot get the database.`;
    }
    conn.query(addUsrTable, (err) => {
        if(err){
            throw `Server cannot add the table to database.`;
        }
        console.log(`[SERVER] : Table ${userTable}. created`);
    });
});
console.log(`Database initialization complete!`);


/* --------------------- EXPRESS ---------------------*/
app.post('/addUser', (req, res) => {
    console.log('Adding user to database....');
    userdb.checkUser(conn, req.body.username, userTable, (err, exist) => {
        if(err || exist){
            console.log(`User ${req.body.username} already exists.`);
            res.status(200).send(JSON.stringify("Fail"));
        } else{
            userdb.createUser(conn, req.body.username, req.body.password, userTable);
            res.status(200).send(JSON.stringify("Success"));
        }
    });
});

app.post('/authUser', (req, res) => {
    console.log('Authenticating user from database....');
    userdb.authUser(conn, req.body.username, req.body.password, (err, authenticate) => {
        if(err || !authenticate){
            console.log(`User ${req.body.username} does not exist.`);
            res.status(200).send(JSON.stringify("!exist"));
        } else{
            res.status(200).send(JSON.stringify("exist"));
        }
    });
});
// app.post('/sendToDB', (req, res) => {
//     let insertPostQuery = `INSERT INTO ${tableName}(topic,data) VALUES('${req.body.postTopic}','${req.body.postMsg}')`;
//     connection.query(insertPostQuery, (err) => {
//         if(err) res.status(400).send('Failed to insert post');
//         else{
//             res.json({resp: "Post successful"});
//             console.log("[SERVER] : Post successfully saved to database.");
//         }
//     });
// });

// app.get('/sendToClient', (req, res) => {
//     let useTable = `SELECT * FROM posts`;
//     connection.query(useTable, (err, rows) => {
//         if(err) res.status(400).send('Failed to send posts to client');
//         else{
//             console.log(`Sending ${rows}`);
//             res.send(JSON.parse(JSON.stringify(rows)));
//             console.log("[SERVER] : All posts sent to client.");
//         }
//     })
// });

app.listen(port, host);
console.log(`HOST ${host} listening on PORT ${port}`);