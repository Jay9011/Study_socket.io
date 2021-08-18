"use strict";

var express = require('express'); // 설치된 express 모듈 사용


var socket = require('socket.io'); // socket.io 모듈 불러오기


var http = require('http'); // Node.js 기본 내장 모듈 불러와서 사용


var fs = require('fs'); // 파일 읽기, 쓰기 등을 할 수 있는 모듈
// express 객체 생성


var app = express(); // express http 서버 생성

var server = http.createServer(app); // 서버를 8080 포트로 listen

server.listen(8080, function () {
  console.log("\uC11C\uBC84 \uC2E4\uD589\uC911...");
}); // 해당 url 접근시 처리

app.get('/', function (req, res) {
  console.log("\u27A1".concat(req.header('x-forwarded-for') || req.connection.remoteAddress, "\uAC00 / \uC73C\uB85C \uC811\uC18D"));
  res.sendFile(__dirname + '/index.html');
}); // 생성된 서버를 socket.io에 바인딩

var io = socket(server); // NameSpace 정의

var nameSpace1 = io.of('/namespace1');
var nameSpace2 = io.of('/namespace2'); // Room 사용

var room = ['room1', 'room2'];
var a = 0;
io.on("connection", function (socket) {
  console.log("---- a user connected ----"); // event 정의 : chat message

  socket.on("chat message", function (msg) {
    io.emit("chat message", msg);
  }); // event 정의 : disconnect
  // 포트가 끊어지면 자동으로 실행되는 이벤트

  socket.on("disconnect", function () {
    console.log("---- user disconnected ----");
  }); // Room join, leave

  socket.on('leaveRoom', function (num, name) {
    socket.leave(room[num], function () {
      console.log(name + ' leave a ' + room[num]);
      io.to(room[num]).emit('leaveRoom', num, name);
    });
  });
  socket.on('joinRoom', function (num, name) {
    socket.join(room[num], function () {
      console.log("joinRoom event on name:".concat(name, " num:").concat(num));
      console.log(name + ' join a ' + room[num]);
      io.to(room[num]).emit('joinRoom', num, name);
    });
  });
  socket.on('room chat message', function (num, name, msg) {
    a = num;
    io.to(room[a]).emit('room chat message', name, msg);
    console.log("send room message:".concat(name, " num:").concat(msg));
  });
});
nameSpace1.on("connection", function (socket) {
  nameSpace1.emit("news", {
    hello: "someone connected at namespace1"
  });
});
nameSpace2.on("connection", function (socket) {
  nameSpace2.emit("news", {
    hello: "someone connected at namespace2"
  });
});