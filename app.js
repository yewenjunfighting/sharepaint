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
// 所有房间绘制信息
var all=[];
var roomInfo=[];

socketIO.on('connection', function (socket) {
    console.log('有人连接');
    socket.on('join', function (username,roomID) {
        for(var i=0,len=roomInfo.length+1;i<len;i++){
            if(i==len-1){
                var obj={id:roomID,people:[username]};
                roomInfo.push(obj);
                break;
            }
            if(roomInfo[i].id==roomID){
                roomInfo[i].people.push(username);
                break;
            }
        }
        var number=0;
        // 加入房间
        socket.join(roomID,function () {
            var allpaint=[];
            for(var j=0;j<all.length;j++){
                if(all[j].roomID==roomID){
                    allpaint.push(all[j]);
                }
            }
            for(var m=0;m<roomInfo.length;m++){
                if(roomInfo[m].id==roomID){
                    number=roomInfo[m].people.length;
                    break;
                }
            }
            socket.emit('message',allpaint,number);
            // 通知房间内人员
            socket.to(roomID).emit('sys','XX加入了房间'+roomID,number);
            console.log('有人加入了' + roomID);
            console.log(roomInfo);
        });
    });

    // 接收用户消息,发送相应的房间
    socket.on('message', function (paint) {
        var roomID=paint.roomID;
        all.push(paint);
        socket.broadcast.to(roomID).emit('message',paint,null);
    });
});


app.use('/', router);

server.listen(3000, () => console.log('Example app listening on port 3000!'))
