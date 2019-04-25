/**
 * Created by Administrator on 2017/8/10.
 * js/painer.js
 */
const eraserWidth=16;
function throttle(fn,delay){
	let prev=Date.now();
	return function(){
		let context=this;
		let args=arguments;
		let current=Date.now();
		if(current-prev>delay){
			fn.apply(context,args);
			prev=current;
		}
	}
}
(function () {
    class Painter{
        constructor(id) {
            let canvasEle = document.getElementById(id);
            canvasEle.width = innerWidth;
            canvasEle.height = innerHeight;
            this.option=1;//记录操作类型 1为画笔 0为橡皮檫
            this.context = canvasEle.getContext("2d");
            this.optionStack=[];//操作记录栈
            this.resultposition=[];
            this.ws=this.initWebSocket();  
            //画笔渐变色
            let linearGradient = this.context.createLinearGradient(0,0,innerWidth,innerHeight);
            linearGradient.addColorStop(0,"#1EEB9F");
            linearGradient.addColorStop(0.5,"#FFFFFF");
            linearGradient.addColorStop(1,"#26B9EB");
            this.context.strokeStyle = linearGradient;

            this.drawLine();
        }
        initWebSocket(){
            let self=this;
            let ws = io();

            // 加入房间
            ws.on('connect', function () {
                ws.emit('join',roomID);
            });

            // 监听消息
            ws.on('message', function (data) {
                if(Array.isArray(data)){
                    self.initCanvas(data);
                }else{
                    self.optionStack.push(data);
                    self.update(data);
                }
            });
            //
            // 监听系统消息
            ws.on('sys', function (sysMsg) {
               console.log(sysMsg);
            });
            return ws;
        }
        drawLine() {
            let self = this;
            let throttleMove = throttle(moveAction,50)
            //监听鼠标按下抬起
            this.context.canvas.addEventListener("mousedown",startAction);
            this.context.canvas.addEventListener("mouseup",endAction);
            //封装鼠标按下函数
            function startAction(event) {
                //如果没有使用橡皮擦就画线
                if(!self.isClear){
                    //开始新的路径
                    self.context.beginPath();
                    self.context.moveTo(event.pageX,event.pageY);
                    self.context.stroke();
                }
                //监听鼠标移动
                self.context.canvas.addEventListener("mousemove",throttleMove);
            }
            //封装鼠标抬起函数
            function endAction() {
                let message={
                    option:self.option,
                    positions:Object.assign([],self.resultposition),
                    lineWidth:self.lineWidth,
                    lineColor:self.context.strokeStyle
                }
                //不再使用橡皮擦
                self.isClear=false;
                self.option=1;
                //移除鼠标移动事件
                self.context.canvas.removeEventListener("mousemove",throttleMove);
                self.optionStack.push(message);
                self.resultposition=[];
                self.ws.send(message,roomID);
                //console.log(JSON.stringify(self.optionStack));
            }
            //封装鼠标移动函数
            function moveAction(event) {
                let item;
                //判断是否启动橡皮擦功能
                if(self.isClear){
                    self.context.clearRect(event.pageX-eraserWidth/2,event.pageY-eraserWidth/2,eraserWidth,eraserWidth);
                    item={x:event.pageX,y:event.pageY};
                    self.resultposition.push(item);
                    return;
                }
                item={x:event.pageX,y:event.pageY};
                self.resultposition.push(item);
                
                self.context.lineTo(event.pageX,event.pageY);
                self.context.stroke();
            }
        }
        //更新画布内容
        update(message){
            let op=message.option;
            switch(op){
                case 0:
                    message.positions.forEach(position=>{
                        this.context.clearRect(position.x-eraserWidth/2,position.y-eraserWidth/2,eraserWidth,eraserWidth);
                    })
                    break;
                case 1:
                    this.context.beginPath();
                    message.positions.forEach(position=>{
                        this.context.lineTo(position.x,position.y);
                        this.context.stroke();
                    })
                    break;
            }
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
            this.context.lineWidth = width;
        }
        //封装设置画笔样式
        isRoundLineCap(isRound) {
            this.context.lineCap = isRound?"round":"butt";
        }
        //封装画笔颜色
        setLineColor(color) {
            this.context.strokeStyle = color;
        }
        //封装画布内容转换
        save(){
            return this.context.canvas.toDataURL();
        }
        //封装橡皮擦
        eraser(){
            this.option=0;
            this.isClear=true;
        }
        //封装清屏
        clearCls(){
            this.context.clearRect(0,0,innerWidth,innerHeight)
        }
    }   
    //Painter定义到window上
    window.Painter = Painter;
})();