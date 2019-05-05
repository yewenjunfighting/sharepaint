let express = require('express');
let path = require('path');
let router = express.Router();
let IO = require('socket.io');
let app = express();
let server = require('http').Server(app);

app.use(express.static(path.join(__dirname, 'client')));
app.set('views', path.join(__dirname, 'client'));
app.set('view engine', 'ejs');

// 创建socket服务
let socketIO = IO(server);
// 所有房间绘制信息
let all = [];
let roomInfo = [];

socketIO.on('connection', function (socket) {
    console.log('有人连接');
    socket.on('join', function (username,roomID) {
        socket.roomID = roomID;
        socket.uesername = username;
        for(let i = 0,len = roomInfo.length + 1;i < len; i ++){
            if(i === len-1){
                let obj = {
                    id:roomID,
                    people:[username]
                };
                roomInfo.push(obj);
                break;
            }
            if(roomInfo[i].id === roomID){
                roomInfo[i].people.push(username);
                break;
            }
        }
        let number = 0;
        // 加入房间
        socket.join(roomID,function () {
            let allpaint = [];
            for(let j = 0;j < all.length;j ++){
                if(all[j].roomID === roomID){
                    allpaint.push(all[j]);
                }
            }
            for(let m = 0;m < roomInfo.length;m ++){
                if(roomInfo[m].id === roomID){
                    number=roomInfo[m].people.length;
                    break;
                }
            }
            socket.emit('message', allpaint,number);
            // 通知房间内人员
            socket.to(roomID).emit('sys','XX加入了房间' + roomID, number);
            // console.log('有人加入了' + roomID);
            // console.log(roomInfo);
        });
    });

    // 接收用户消息,发送相应的房间
    socket.on('message', function (paint) {
        let roomID = paint.roomID;
        all.push(paint);
        socket.broadcast.to(roomID).emit('message', paint,null);
    });
    //清空画板
    socket.on('clear', function (paint) {
        let roomID = paint.roomID;
        for(let i = all.length - 1;i >= 0;i --){
            if(all[i].roomID === roomID){
                all.splice(i,1);
            }
        }
        console.log(all);
        socketIO.to(roomID).emit('message', paint,null);
    });
    socket.on('disconnect', function () {
        // 从房间名单中移除
        let number = 0;
        for(let i = 0;i < roomInfo.length; i ++){
            if(roomInfo[i].id === socket.roomID){
                let index = roomInfo[i].people.indexOf(socket.username);
                roomInfo[i].people.splice(index, 1);
                number=roomInfo[i].people.length;
                if(number === 0){
                    for(let j = all.length - 1;j >= 0;j --){
                        if(all[j].roomID === socket.roomID){
                            all.splice(j,1);
                        }
                    }
                }
                break;
            }
        }
        socket.to(socket.roomID).emit('sys','XX离开了房间'+socket.roomID,number);
        socket.leave(socket.roomID);    // 退出房间
        console.log(all);
        // console.log(socket.roomID);
      });
});


app.use('/', router);

server.listen(3000, () => console.log('Example app listening on port 3000!'));
