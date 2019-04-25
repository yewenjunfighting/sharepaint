var DouglasPeucker = {
  getProcessPoints: function(points, tolerance) {
      /// <summary>获取处理后的点</summary>
      /// <param name="points" type="Array">包含点的数组</param>
      /// <param name="tolerance" type="Float">取样临界值</param>
      /// <returns type="Array" />
      if (!Array.isArray(points) || !points.length) { //当points不是数组或没有值时，直接返回一个空数组
          return [];
      }
      if (points.length < 3) return points; //小于3个点时不抽稀，因为1个或2个点无法进行抽稀
      var firstPoint = 0,
          lastPoint = points.length - 1; //取开始点与结束点的下标
      var pointIndexsToKeep = []; //保存需要点下标的数组
      pointIndexsToKeep.push(firstPoint);
      pointIndexsToKeep.push(lastPoint); //开始与结束不进行处理，直接保留
      while (points[firstPoint] == points[lastPoint]) { //处理闭合情况，闭合时，强制断开
          lastPoint--;
      }
      this.reduce(points, firstPoint, lastPoint, tolerance, pointIndexsToKeep); //抽稀
      var resultPoints = []; //返回的点数组
      pointIndexsToKeep.sort(function(a, b) { //排序，这个可排可不排
          return a - b;
      });
      for (var i = 0; i < pointIndexsToKeep.length; i++) {
          resultPoints.push(points[pointIndexsToKeep[i]]);
      }
      return resultPoints;
  },
  reduce: function(points, firstPoint, lastPoint, tolerance, pointIndexsToKeep) {
      var maxDis = 0,
          idxFarthest = 0; //定义最大长度及最远点的下标
      for (var i = firstPoint, dis; i < lastPoint; i++) {
          dis = this.perpendicularDistance(points[firstPoint], points[lastPoint], points[i]); //获取当前点到起点与
          if (dis > maxDis) { //保存最远距离
              maxDis = dis;
              idxFarthest = i;
          }
      }
      if (maxDis > tolerance && idxFarthest != 0) { //如果最远距离大于临界值
          pointIndexsToKeep.push(idxFarthest);
          this.reduce(points, firstPoint, idxFarthest, tolerance, pointIndexsToKeep);
          this.reduce(points, idxFarthest, lastPoint, tolerance, pointIndexsToKeep);
      }
  },
  perpendicularDistance: function(beginPoint, endPoint, comparePoint) {
      /// <summary>计算给出的comparePoint到beginPoint与endPoint组成的直线的垂直距离</summary>
      /// <param name="beginPoint" type="Object">起始点</param>
      /// <param name="endPoint" type="Object">结束点</param>
      /// <param name="comparePoint" type="Object">比较点</param>
      /// <returns type="Float" />
      //Area = |(1/2)(x1y2 + x2y3 + x3y1 - x2y1 - x3y2 - x1y3)|   *Area of triangle
      //Base = v((x1-x2)2+(y1-y2)2)                               *Base of Triangle*
      //Area = .5*Base*H                                          *Solve for height
      //Height = Area/.5/Base
      var area = Math.abs(0.5 * (beginPoint.x * endPoint.y + endPoint.x * comparePoint.y + comparePoint.x * beginPoint.y -
          endPoint.x * beginPoint.y - comparePoint.x * endPoint.y - beginPoint.x * comparePoint.y));
      var bottom = Math.sqrt(Math.pow(beginPoint.x - endPoint.x, 2) + Math.pow(beginPoint.y - endPoint.y, 2));
      var height = area / bottom * 2;
      return height;
  }
};
// class DPAlgorithm {
//     constructor(points, tolerance) {
//       this.tolerance = tolerance
//     }
//     vacuate(points) {
//       this.points = points
//       if(!this.points.length) {
//         throw new Error('没有传入待抽稀数组')
//       }
//       if (this.points.length < 3) return this.points
  
//       let spIndex = 0
//       let epIndex = this.points.length -1
//       let indexArr = []
//       indexArr.push(spIndex)
//       indexArr.push(epIndex)
  
//       while(this.points[spIndex].x == this.points[epIndex].x && this.points[spIndex].y == this.points[epIndex].y) {
//         epIndex --
//       }
  
//       this.reduce(spIndex, epIndex, indexArr)
  
//       indexArr.sort((a, b) => a - b);
//       return indexArr.map(index => this.points[index])
  
//     }
//     reduce(spIndex, epIndex, indexArr) {
//       let maxDist = 0, idxFarthest = 0
//       for (let i = spIndex, dist; i < epIndex; i++) {
//         dist = this.verticalDimension(this.points[spIndex], this.points[epIndex], this.points[i]) //获取当前点到起点与
//         if (dist > maxDist) { //保存最远距离
//             maxDist = dist
//             idxFarthest = i
//         }
//       }
//       if (maxDist > this.tolerance && idxFarthest != 0) { //如果最远距离大于临界值
//           indexArr.push(idxFarthest);
//           this.reduce(spIndex, idxFarthest, indexArr)
//           this.reduce(idxFarthest, epIndex, indexArr)
//       }
//     }
//     verticalDimension(startPoint, endPoint, comparePoint) {
//       const x1 = endPoint[0] - startPoint[0]
//       const y1 = endPoint[1] - startPoint[1]
//       const x2 = endPoint[0] - comparePoint[0]
//       const y2 = endPoint[1] - comparePoint[1]  
  
//       const beDist = Math.sqrt((startPoint[0] - endPoint[0]) ** 2 + (startPoint[1] - endPoint[1]) ** 2)
//       return Math.abs(x1 * y2 - x2 * y1) / beDist
//     }
//   }