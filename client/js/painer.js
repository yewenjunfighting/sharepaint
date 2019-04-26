/**
 * Created by Administrator on 2017/8/10.
 * js/painer.js
 */
let canvasEle = document.getElementById('box');
            canvasEle.width = 1100;
            canvasEle.height = 650;
const eraserWidth=16;
let _EleLeft=getElementLeft(canvasEle),_EleTop=getElementTop(canvasEle);
console.log(_EleLeft,_EleTop)
function getElementLeft(element){
    let actualLeft=element.offsetLeft;
    let current=element.offsetParent;
    while(current!==null){
        actualLeft+=current.offsetLeft;
        current=current.offsetParent;
    }
    return actualLeft;
}
function getElementTop(element){
    let actualTop=element.offsetTop;
    let current=element.offsetParent;
    while(current!==null){
        actualTop+=current.offsetTop;
        current=current.offsetParent;
    }
    return actualTop;
}
function throttle(fn,delay,context){
	let prev=Date.now();
	return function(){
		let args=arguments;
		let current=Date.now();
		if(current-prev>delay){
			fn.apply(context,args);
			prev=current;
		}
	}
}
function debounce(fn,delay){
	let timer=null;
	return function(){
		let context=this;
		let args=arguments;
		clearTimeout(timer);
		timer=setTimeout(()=>{
			fn.apply(context,args)
		},delay)
	}
}

(function () {
    class Painter{
        constructor(id) {
            
            this.option=1;//记录操作类型 1为画笔 0为橡皮檫
            this.context = canvasEle.getContext("2d");
            this.optionStack=[];//操作记录栈
            this.resultposition=[];
            this.message={};
            this.roomID;
            this.ws={};
            // this.ws=this.initWebSocket();
            this.context.strokeStyle = '#000';  
            this.isBegin=-1;//起始点
            //画笔渐变色
            // let linearGradient = this.context.createLinearGradient(0,0,900,600);
            // linearGradient.addColorStop(0,"#1EEB9F");
            // linearGradient.addColorStop(0.5,"#FFFFFF");
            // linearGradient.addColorStop(1,"#26B9EB");
            // this.context.strokeStyle = linearGradient;
            this.initEvent();
            this.drawLine();
        }
        
        //事件注册中心
        initEvent(){
            this.startAction=startAction;
            this.endAction=endAction;
            this.moveAction=moveAction;
            this.mouseStart=mouseStart;
            this.mouseMove=mouseMove;
            this.mouseUp=mouseUp;
            let self=this;
            let sendMessageT=throttle(this.sendMessage,50,this);
            //鼠标移出 就移除mousemove事件
            // this.context.canvas.onmouseleave=function(e){
            //     this.context.canvas.removeEventListener("mousemove",this.startAction);
            // }
            // function mouseLeave(){
            //     console.log('mouseLeave');
            // }
             //封装鼠标按下函数
            function startAction(event) {
                //如果没有使用橡皮擦就画线
                if(!self.isClear){
                    //开始新的路径
                    self.context.beginPath();
                    self.context.moveTo(event.pageX-_EleLeft,event.pageY-_EleTop);
                    self.context.stroke();
                }
                //监听鼠标移动
                self.context.canvas.addEventListener("mousemove",self.moveAction);
            }
            //封装鼠标抬起函数
            function endAction() {
                self.isBegin=0;
                let positions;
                if(self.option){
                    positions=DouglasPeucker.getProcessPoints(self.resultposition, 1);
                }else{
                    positions=self.resultposition;
                }
                let message={
                    option:self.option,
                    positions:Object.assign([],positions),
                    lineWidth:self.lineWidth,
                    lineColor:self.context.strokeStyle,
                    isBegin:self.isBegin,
                    isEnd:1,
                    roomID:self.roomID
                }
                //移除鼠标移动事件
                self.context.canvas.removeEventListener("mousemove",self.moveAction);
                self.optionStack.push(message);
                self.resultposition=[];
                self.ws.send(message);
                self.isBegin=-1;
                //console.log(JSON.stringify(this.optionStack));
            }
            //封装鼠标移动函数
            function moveAction(event) {
                let item;
                let width=self.lineWidth;
                //判断是否启动橡皮擦功能
                if(self.isClear){
                    self.context.clearRect(event.pageX-width/2-_EleLeft,event.pageY-width/2-_EleTop,width,width);
                    item={x:event.pageX - _EleLeft,y:event.pageY - _EleTop};
                    self.resultposition.push(item);
                    return;
                }
                item={x:event.pageX - _EleLeft,y:event.pageY - _EleTop};
                self.resultposition.push(item);
                
                self.context.lineTo(event.pageX - _EleLeft,event.pageY - _EleTop);
                self.context.stroke();
                sendMessageT();
            }
            function mouseStart(e){
                let startX=0,startY=0,id='rect';
                let evt = window.event || e;
                let div = document.createElement("div");
                startX = evt.offsetX;
                startY = evt.offsetY;
                div.id = id;
                div.className = "rect";
                div.style.marginLeft = startX + "px";
                div.style.marginTop = startY + "px";
                document.querySelector('.containerBox').appendChild(div);
                self.message.option=2;
                self.message.x1=evt.offsetX;
                self.message.y1=evt.offsetY;
                self.context.canvas.addEventListener("mousemove",self.mouseMove);
            }
            function mouseMove(e){
                let evt = window.event || e;
                let rectLeft,rectTop,rectHeight,rectWidth;
                let startX=self.message.x1,startY=self.message.y1;
                // var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                // var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                
                rectLeft = (startX - (evt.offsetX ) > 0 ? evt.offsetX : startX) + "px";
                rectTop = (startY - (evt.offsetY )> 0 ? evt.offsetY : startY) + "px";
                rectHeight = Math.abs(startY - (evt.offsetY)) + "px";
                rectWidth = Math.abs(startX - (evt.offsetX)) + "px";
                if(document.querySelector('#rect')){
                    document.querySelector('#rect').style.marginLeft = rectLeft;
                    document.querySelector('#rect').style.marginTop = rectTop;
                    document.querySelector('#rect').style.width = rectWidth;
                    document.querySelector('#rect').style.height = rectHeight;
                }
            }
            function mouseUp(e){
                if(document.querySelector('#rect')){
                    document.querySelector('#rect').remove();
                    let evt = window.event || e;
                    let x1=self.message.x1 ,y1=self.message.y1 ;
                    self.message.x2=evt.pageX - _EleLeft;
                    self.message.y2=evt.pageY - _EleTop;
                    self.message.lineWidth=self.lineWidth;
                    self.message.lineColor=self.context.strokeStyle;
                    self.message.roomID=self.roomID;
                    self.ws.send(self.message);
                    self.context.beginPath();
                    self.context.rect(x1,y1,self.message.x2-x1,self.message.y2-y1);
                    console.log(evt)
                    console.log(x1,y1,self.message.x2,self.message.y2)
                    self.context.stroke();
                    //恢复空对象
                    self.message={};
                    self.context.canvas.removeEventListener("mousemove",self.mouseMove);
                }
            }
        }
        // fixPosition(position){
        //     if(position.x1>position.x2){
        //         let x=position.x1;
        //         position.x1=position.x2;
        //         position.x2=x;
        //     }
        //     if(position.y1>position.y1){
        //         let y=position.cuttingY1;
        //         position.y1=position.y2;
        //         position.y2=y;
        //     }
        //     return position
        // }
        initWebPainter(username,roomID){
            let self=this;
            let ws = io();
            // 加入房间
            ws.on('connect', function () {
                ws.emit('join',username,roomID);
            });
            // 监听消息
            ws.on('message', function (data,flag) {
                console.log(data)
                if(flag===null);
                else document.getElementById('user-count').innerHTML=flag;
                if(Array.isArray(data)){
                    self.initCanvas(data);
                }else{
                    self.optionStack.push(data);
                    self.update(data);
                }
            });
            // 监听系统消息
            ws.on('sys', function (sysMsg,number) {
                console.log(sysMsg,number);
                document.getElementById('user-count').innerHTML=number;
            });
            self.ws=ws;
            self.roomID=roomID;
        }
        drawRect(){
            this.changeMode(1);
        }
        sendMessage(){
            if(this.isBegin==-1){
                this.isBegin=1;
            }else{
                this.isBegin=0;
            }
            let message={
                option:this.option,
                positions:Object.assign([],DouglasPeucker.getProcessPoints(this.resultposition, 1)),
                lineWidth:this.lineWidth,
                lineColor:this.context.strokeStyle,
                isBegin:this.isBegin,
                isEnd:0,
                roomID:this.roomID
            }
            this.resultposition=[];
            this.ws.send(message);
        }
        changeMode(mode){
            switch(mode){
                case 1://矩形框模式
                    this.context.canvas.removeEventListener("mousedown",this.startAction);
                    //this.context.canvas.removeEventListener("mousemove",this.moveAction);
                    document.body.removeEventListener("mouseup",this.endAction);
                    this.context.canvas.addEventListener("mousedown",this.mouseStart);
                    document.body.addEventListener("mouseup",this.mouseUp);
                    break;
                case 2://画笔模式
                    this.context.canvas.addEventListener("mousedown",this.startAction);
                    document.body.addEventListener("mouseup",this.endAction);
                    this.context.canvas.removeEventListener("mousedown",this.mouseStart);
                    
                    document.body.removeEventListener("mouseup",this.mouseUp);
                    break;
                case 3://橡皮檫模式
                    this.context.canvas.addEventListener("mousedown",this.startAction);
                    document.body.addEventListener("mouseup",this.endAction);
                    
                    this.context.canvas.removeEventListener("mousedown",this.mouseStart);
                    // this.context.canvas.removeEventListener("mousemove",this.moveAction);
                    document.body.removeEventListener("mouseup",this.mouseUp);
            }
        }
        drawLine() {
            this.changeMode(2);
            this.option=1;
            this.isClear=false;
            //监听鼠标按下抬起
            this.context.canvas.addEventListener("mousedown",this.startAction);
            document.body.addEventListener("mouseup",this.endAction);
        }
        
        //更新画布内容
        update(message){
            console.log(message)
            let op=message.option;
            let lineWidth=this.lineWidth;
            let originColor=this.context.strokeStyle;
            let width=message.lineWidth?message.lineWidth:this.lineWidth;
            let color=message.lineColor?message.lineColor:this.context.strokeStyle;
            this.setLineWidth(width);
            this.setLineColor(color);
            switch(op){
                //橡皮檫
                case 0:
                    message.positions.forEach(position=>{
                        this.context.clearRect(position.x-width/2,position.y-width/2,width,width);
                    })
                    break;
                case 1:
                //铅笔
                    if(message.isBegin){
                        this.context.beginPath();
                    }
                    message.positions.forEach(position=>{
                        this.context.lineTo(position.x,position.y);
                        this.context.stroke();
                    })
                    break;
                
                case 2:
                    this.context.beginPath();
                    this.context.rect(message.x1,message.y1,message.x2-message.x1,message.y2-message.y1);
                    this.context.stroke();
                    break;
                //清屏
                case 3:
                    this.optionStack=[];
                    this.context.clearRect(0,0,900,600);
                    break;
            }
            this.setLineWidth(lineWidth);
            this.setLineColor(originColor);
        }
        //初始化画布
        initCanvas(data){
            this.optionStack=data;
            this.optionStack.forEach(op=>{
                this.update(op);
            })
        }
        //封装画笔宽度
        setLineWidth(width) {
            this.lineWidth = width;
            this.context.lineWidth = width;
        }
        //封装画布内容转换
        save(filename) {
            const MIME_TYPE = "image/png",
            tempLink = document.createElement('a');
            tempLink.href = canvasEle.toDataURL(MIME_TYPE);
            tempLink.download = filename || 'result';
            document.body.append(tempLink);
            tempLink.click();
            tempLink.remove();
        };
        //封装设置画笔样式
        isRoundLineCap(isRound) {
            this.context.lineCap = isRound?"round":"butt";
        }
        //封装画笔颜色
        setLineColor(color) {
            this.context.strokeStyle = color;
        }
        //封装橡皮擦
        eraser(){
            this.changeMode(3);
            this.option=0;
            this.isClear=true;
        }
        //封装清屏
        clearCls(){
            let message={
                option:3,
                positions:[],
                lineWidth:0,
                lineColor:'',
                isBegin:-1,
                isEnd:0,
                roomID:this.roomID
            }
            this.optionStack=[];
            this.context.clearRect(0,0,900,600);
            this.ws.emit('clear',message);
        }
        exit(){
            this.context.clearRect(0,0,900,600);
        }
    }   
    //Painter定义到window上
    window.Painter = Painter;
})();
window.onresize=debounce(function(){
    _EleLeft=getElementLeft(canvasEle);
    _EleTop=getElementTop(canvasEle);
},500)