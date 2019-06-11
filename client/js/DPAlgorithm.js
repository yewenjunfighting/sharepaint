/**
 * 原理: 道格拉斯抽稀算法, 用折线来近似曲线
 * */
let DouglasPeucker = {
    /**
     * points 里存储了所有的点
     * tolerance 是一个阈值
     * */
  getProcessPoints: function(points, tolerance) {
      if (!Array.isArray(points) || !points.length) { //当points不是数组或没有值时，直接返回一个空数组
          return [];
      }
      if (points.length < 3) return points; //小于3个点时不抽稀，因为1个或2个点无法进行抽稀
      let firstPoint = 0,
          lastPoint = points.length - 1; //取开始点与结束点的下标
      let pointIndexToKeep = []; //保存需要点下标的数组
      pointIndexToKeep.push(firstPoint);
      pointIndexToKeep.push(lastPoint); //开始与结束不进行处理，直接保留
      while (points[firstPoint] === points[lastPoint]) { //处理闭合情况，闭合时，强制断开
          lastPoint--;
      }
      this.reduce(points, firstPoint, lastPoint, tolerance, pointIndexToKeep); //抽稀
      let resultPoints = []; //返回的点数组
      // pointIndexToKeep里存的是点的下标
      pointIndexToKeep.sort(function(a, b) { //排序，这个可排可不排 升序排列
          return a - b;
      });
      for (let i = 0; i < pointIndexToKeep.length; i++) {
          resultPoints.push(points[pointIndexToKeep[i]]);
      }
      return resultPoints;
  },
    /**
     * points 原始点的数组
     * firstPoint 初始点位于points中的下标 值为0
     * lastPoint 最后一个点在point中的下标 如果points中开始点与最后一个点重合,那么lastPoint为points.length - 1, 否则为points.length
     * tolerance
     * pointIndexToKeep 存储保存下来的点在points中的下标
     * */
  reduce: function(points, firstPoint, lastPoint, tolerance, pointIndexToKeep) {
      let maxDis = 0,
          idxFarthest = 0; //定义最大长度及最远点的下标
      for (let i = firstPoint, dis; i < lastPoint; i++) {
          // 求出曲线上的点到曲线的弦上的最大距离
          dis = this.perpendicularDistance(points[firstPoint], points[lastPoint], points[i]); //获取当前点到起点与
          if (dis > maxDis) { //保存最远距离
              maxDis = dis;
              idxFarthest = i;
          }
      }

      if (maxDis > tolerance && idxFarthest !== 0) { //如果最远距离大于临界值
          //
          pointIndexToKeep.push(idxFarthest);
          this.reduce(points, firstPoint, idxFarthest, tolerance, pointIndexToKeep);
          this.reduce(points, idxFarthest, lastPoint, tolerance, pointIndexToKeep);
      }
  },

  perpendicularDistance: function(beginPoint, endPoint, comparePoint) {
      // 求三角形的面积 用叉积求解
      // a x b = |a| * |b| * sin<a, b>
      // (x1, y1) x (x2, y2) = x1y2 - y1x2
      let area = Math.abs(0.5 * (beginPoint.x * endPoint.y + endPoint.x * comparePoint.y + comparePoint.x * beginPoint.y -
          endPoint.x * beginPoint.y - comparePoint.x * endPoint.y - beginPoint.x * comparePoint.y));
      let bottom = Math.sqrt(Math.pow(beginPoint.x - endPoint.x, 2) + Math.pow(beginPoint.y - endPoint.y, 2));
      return area / bottom * 2;
  }
};
