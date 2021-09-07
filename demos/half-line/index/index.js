const app = getApp();
Page({
  data: {
    latitude: 39.867690,
    longitude: 116.462797,
    scale: 16,
    zoom:app.globalData.zoom,
    markers: [{
      id: 1,
      latitude: 39.867690,
      longitude: 116.462797,
      name: '德元九和大厦'
    }],
    polygons: [
      {
        points: [
          { latitude: 39.870978, longitude: 116.464484 },
          { latitude: 39.870218, longitude: 116.462540 },
          { latitude: 39.868246, longitude: 116.459793 },
          { latitude: 39.865730, longitude: 116.461837 },
          { latitude: 39.866805, longitude: 116.465769 },
          { latitude: 39.869625, longitude: 116.466826 }],
        strokeColor: '#0f0f0f',
        strokeWidth: 2
      }
    ],
    polygons_points: [],
  },
  onShareAppMessage() {
    return {
      title: 'fanfish\'s map',
      path: 'pages/index/index'
    }
  },
  build_points: function () {
    let points = new Array();
    for (let index = 0; index < this.data.polygons[0].points.length; index++) {
      let y = Math.round((this.data.polygons[0].points[index].latitude - this.data.latitude) * this.data.zoom);
      let x = Math.round((this.data.polygons[0].points[index].longitude - this.data.longitude) * this.data.zoom);
      let point = { x: x, y: y };
      points[index] = point;
    }
    return points;
  },

  max: function (a, b) {
    let max = a > b ? a : b;
    return max;
  },

  get2dcoordinate: function (p_latitude, p_longitude) {
    let point_y = Math.round((p_latitude - this.data.latitude) * this.data.zoom);
    let point_x = Math.round((p_longitude - this.data.longitude) * this.data.zoom);
    return { x: point_x, y: point_y };
  },
  isInside: function (polygons_points, p_x, p_y) {
    let intersectionCount = 0;
    for (let i = 0; i < polygons_points.length; i++) {
      let p1_y = polygons_points[i].y;
      let p1_x = polygons_points[i].x;
      let next = (i + 1) % polygons_points.length;
      let p2_y = polygons_points[next].y;
      let p2_x = polygons_points[next].x;
      if (p1_y < p_y && p2_y < p_y) {
        //console.log("both points are in region R1");
      } else if (p1_y >= p_y && p2_y >= p_y) {
        //console.log("both points are in region R2");
      } else {
        //当p_x > this.max(p1_x,p2_x),点p位于边(p1->p2)右侧，起始自p点的半线无法与其相交
        if (p_x <= this.max(p1_x, p2_x)) {
          //当p1_y == p2_y，半线与边(p1->p2)平行
          if (p1_y != p2_y) {
            //当p1_x == p2_x，交点的x坐标与p1、p2的x坐标相等，即交点是边(p1->p2)上的一点；
            let intersection_x = (p_y - p1_y) * (p2_x - p1_x) / (p2_y - p1_y) + p1_x;
            //半线与边(p1->p2)的交点，必须位于p点的右侧
            if (p_x <= intersection_x)
              intersectionCount++;
          }
        }
      }
    }
    if (intersectionCount % 2 == 0) {
      return 0;
    } else {
      return 1;
    }
  },

  poitap: function (e) {
    let name = e.detail.name;
    let longitude = e.detail.longitude;
    let latitude = e.detail.latitude;
    let poi_markers = [{
      id: 1,
      latitude: latitude,
      longitude: longitude,
      name: name
    }];
    this.setData({
      markers: poi_markers
    });
    let point = this.get2dcoordinate(latitude, longitude);
    let result = this.isInside(this.data.polygons_points, point.x, point.y);
    let title = "inside!";
    if (result == 1) {
      //console.log(name+" is inside!");
      wx.showToast({
        title: title,
        duration: 1500
      })
    } else {
      title = "outside!";
      //console.log(name+" is outside!");
      wx.showToast({
        title: title,
        duration: 1500
      })
    }
  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap');    
    let points = this.build_points(); 
    this.setData({
      polygons_points: points
    });
  },

  currentLocation: function () {
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        wx.openLocation({
          latitude: latitude,
          longitude: longitude,
          scale: 14
        })
      }
    })
  },
  getCenterLocation: function () {
    var _this = this;
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  initLocation: function () {
    this.mapCtx.moveToLocation({
      latitude: 39.867690,
      longitude: 116.462797
    });
    let poi_markers = [{
      id: 1,
      latitude: 39.867690,
      longitude: 116.462797
    }];
    this.setData({
      markers: poi_markers
    });
  }
})