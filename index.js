const express = require("express");
const ws = require("ws");
const url = require('url');

var app = express();


app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/index.html");
});


app.get("/teacher", (req,res)=>{
    res.sendFile(__dirname + "/teacher.html");
});



var server = app.listen(80);

var teacher_connection;
var connections = [];

var wsServer = new ws.Server({noServer: true});

server.on("upgrade", (request, socket, head)=>
{
    var path = url.parse(request.url).path
    
    if(path === "/")
    {
        wsServer.handleUpgrade(request,socket, head, connection=>
        {
            
            connections.push(connection);
   
            connection.on("message", data=>
            {
                if(teacher_connection)
                teacher_connection.send(data);
            });

            connection.on("close", e=>
            {
                connections = connections.filter(c=> c !== connection);
                console.log("close");
            });
    
        });
    }

    else if(path === "/teacher" && !teacher_connection)
    {
        wsServer.handleUpgrade(request,socket, head, connection=>
        {
            teacher_connection = connection;
            console.log("teacher opened connection");

            connection.on("message", data=>
            {
                connections.forEach(c=>c.send(data));
            });

            connection.on("close", e=>
            {
                teacher_connection = null
                console.log("teacher closed connection");
            });
        })
    }
    
    
});

wsServer.on("connection", connection=>
{
    
    connections.push(connection);

    connection.on("close", e=>
    {
        connections = connections.filter(c=> c !== connection);
    });

});



process.stdin.setRawMode(true);

process.stdin.on("data", data =>process.exit());