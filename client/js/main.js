/**
 * Created by Administrator on 2017/8/10.
 * js/main.js
 */
(function () {
    function init() {
        var panter = new Painter("box");
        panter.setLineWidth(5);
        panter.isRoundLineCap(true);
        //panter.setLineColor("#242424");
        var toolView = document.querySelector(".tool");
        document.querySelector(".openButton").onclick = function () {
            toolView.style.display = toolView.style.display === "block"?"none":"block";
        };
        document.querySelector("input[type=range]").value = panter.context.lineWidth*2;
        //input的range绑定到画笔宽度
        document.querySelector("input[type=range]").onchange = function () {
            panter.setLineWidth(this.value/2);
        };
        //获取color颜色绑定到画笔
        document.querySelector("input[type=color]").onchange = function () {
            panter.setLineColor(this.value);
        };
        //清屏
        document.querySelector('.clearButton').onclick = function() {
            panter.clearCls();
        }
        //橡皮擦
        document.querySelector('.tool button').onclick=function(){
            panter.eraser();
        }
        //下载画布内容
        document.querySelector(".download").onclick=function(){   
            var a=panter.save();
            console.log(1);
            this.href=a;
        }
    }
    init();
})();