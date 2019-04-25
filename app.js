var express = require('express')
var path = require('path');
var router = express.Router();
var IO = require('socket.io');
var app = express();
var server = require('http').Server(app);

app.use(express.static(path.join(__dirname, 'client')));
app.set('views', path.join(__dirname, 'client'));
app.set('view engine', 'ejs');

// 创建socket服务
var socketIO = IO(server);
// 房间用户名单
var roomInfo = {};

socketIO.on('connection', function (socket) {
    console.log('有人连接');
    socket.on('join', function (roomID) {
        // 加入房间
        socket.join(roomID);
        // 通知房间内人员
        socket.broadcast.to(roomID).emit('sys','XX加入了房间'+roomID);
        console.log('有人加入了' + roomID);
    });

    // socket.on('leave', function () {
    //     socket.emit('disconnect');
    // });

    // socket.on('disconnect', function () {
    //     // 从房间名单中移除
    //     var index = roomInfo[roomID].indexOf(user);
    //     if (index !== -1) {
    //         roomInfo[roomID].splice(index, 1);
    //     }
    //
    //     socket.leave(roomID);    // 退出房间
    //     socketIO.to(roomID).emit('sys', user + '退出了房间', roomInfo[roomID]);
    //     console.log(user + '退出了' + roomID);
    // });

    // 接收用户消息,发送相应的房间
    socket.on('message', function (paint,roomID) {
        // 验证如果用户不在房间内则不给发送
        // if (roomInfo[roomID].indexOf(user) === -1) {
        //     return false;
        // }
        // console.log(paint,roomID);
        socket.broadcast.to(roomID).emit('message',paint);
    });
});

router.get('/room', function (req, res) {
    var roomID = req.query.roomid;
    res.render('room', {
        roomID: roomID
    });
});

app.use('/', router);

server.listen(3000, () => console.log('Example app listening on port 3000!'))