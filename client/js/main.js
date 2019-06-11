/**
 * Painter是个类, 被附加到window上面
 * */
(function () {
    function init() {
        let painter = new Painter("box");
        let range = document.querySelector('input[type=range]');
        painter.setLineWidth(5);
        painter.isRoundLineCap(true);
        let toolView = document.querySelector(".tool");
        document.querySelector(".openButton").onclick = function () {
            toolView.style.display = toolView.style.display === "block" ? "none" : "block";
        };
        range.value = painter.context.lineWidth * 2;
        //input的range绑定到画笔宽度
        range.onchange = function () {
            painter.setLineWidth(this.value / 2);
        };
        //获取color颜色绑定到画笔
        document.querySelector("input[type=color]").onchange = function () {
            painter.setLineColor(this.value);
        };
        //清屏
        document.querySelector('.clearButton').onclick = function() {
            painter.clearCls();
        };
        //橡皮擦
        document.querySelector('.tool button').onclick = function(){
            painter.eraser();
        };
        //下载画布内容
        document.querySelector(".download").onclick = function(){
            this.href =painter.save();
        };
    }
    init();
})();
