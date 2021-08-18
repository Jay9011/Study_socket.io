const express = require('express'); // 설치된 express 모듈 사용
const socket = require('socket.io'); // socket.io 모듈 불러오기
const http = require('http'); // Node.js 기본 내장 모듈 불러와서 사용
const fs = require('fs'); // 파일 읽기, 쓰기 등을 할 수 있는 모듈

// express 객체 생성
const app = express();
// express http 서버 생성
const server = http.createServer(app);
// 서버를 8080 포트로 listen
server.listen(8080, function () {
    console.log(`서버 실행중...`);
});
// 해당 url 접근시 처리
app.get('/', function (req, res) {
    console.log(`➡${req.header('x-forwarded-for') || req.connection.remoteAddress}가 / 으로 접속`);
    res.sendFile(__dirname + '/index.html');
});

// 생성된 서버를 socket.io에 바인딩
const io = socket(server);
// NameSpace 정의
const nameSpace1 = io.of('/namespace1');
const nameSpace2 = io.of('/namespace2');
// Room 사용
let room = ['room1', 'room2'];
let a = 0;

io.on(`connection`, (socket) => {
    console.log(`---- a user connected ----`);
    // event 정의 : chat message
    socket.on(`chat message`, (msg) => {
        io.emit(`chat message`, msg);
    });
    // event 정의 : disconnect
    // 포트가 끊어지면 자동으로 실행되는 이벤트
    socket.on(`disconnect`, () => {
        console.log(`---- user disconnected ----`);
    });
    // Room join, leave
    socket.on('leaveRoom', (num, name) => {
        socket.leave(room[num], () => {
            console.log(name + ' leave a ' + room[num]);
            io.to(room[num]).emit('leaveRoom', num, name);
        });
    });
    socket.on('joinRoom', (num, name) => {
        socket.join(room[num], () => {
            console.log(`joinRoom event on name:${name} num:${num}`);
            console.log(name + ' join a ' + room[num]);
            io.to(room[num]).emit('joinRoom', num, name);
        });
    });
    socket.on('room chat message', (num, name, msg) => {
        a = num;
        io.to(room[a]).emit('room chat message', name, msg);
        console.log(`send room message:${name} num:${msg}`);
    });
});

nameSpace1.on(`connection`, (socket) => {
    nameSpace1.emit(`news`, {
        hello: `someone connected at namespace1`
    });
});
nameSpace2.on(`connection`, (socket) => {
    nameSpace2.emit(`news`, {
        hello: `someone connected at namespace2`
    });
})