// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken =
  ACCESS_TOKEN;

var viewer = new Cesium.Viewer("cesiumContainer");

var scene = viewer.scene;
var ellipsoid = Cesium.Ellipsoid.WGS84;
var geodesic = new Cesium.EllipsoidGeodesic();
const mode = document.forms.modes.elements["mode"];

var value, title, count;

var tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(ASSET_ID),
  })
);

tileset.readyPromise
  .then(function () {
    viewer.zoomTo(tileset);

    // Apply the default style if it exists
    var extras = tileset.asset.extras;
    if (
      Cesium.defined(extras) &&
      Cesium.defined(extras.ion) &&
      Cesium.defined(extras.ion.defaultStyle)
    ) {
      tileset.style = new Cesium.Cesium3DTileStyle(extras.ion.defaultStyle);
    }

    value = document.getElementById("value");
    title = document.getElementById("title");
    count = document.getElementById("count");
    window.clearAll = function () {
      points.removeAll();
      count.innerText = points.length;
      polylines.removeAll();
      value.innerText = "Select 2 points.";
    };
    window.updateValue = function () {
      count.innerText = points.length;
      if (points.length >= 2) {
        polylines.removeAll();
        let distance = 0;
        switch (mode.value) {
          case "d":
            title.innerText = "Distance:";
            for (let p = 1; p < points.length; p++) {
              distance += getDistance(points.get(p - 1), points.get(p));
              drawLine(points.get(p - 1), points.get(p));
            }
            if (distance >= 1000) {
              value.innerText = (distance / 1000).toFixed(1) + " км";
            } else {
              value.innerText = distance.toFixed(2) + " м";
            }
            break;
          case "hd":
            title.innerHTML = "Horizontal Distance<br/>(1st and last point):";
            distance = getHorizontalDistance(
              points.get(0),
              points.get(points.length - 1)
            );
            drawHorizontalLine(points.get(0), points.get(points.length - 1));
            if (distance >= 1000) {
              value.innerText = (distance / 1000).toFixed(1) + " км";
            } else {
              value.innerText = distance.toFixed(2) + " м";
            }
            break;
          case "vd":
            title.innerHTML = "Vertical Distance<br/>(1st and last point):";
            distance = getVerticalDistance(
              points.get(0),
              points.get(points.length - 1)
            );
            drawVerticalLine(points.get(0), points.get(points.length - 1));
            if (distance >= 1000) {
              value.innerText = (distance / 1000).toFixed(1) + " км";
            } else {
              value.innerText = distance.toFixed(2) + " м";
            }
            break;
          case "a":
            title.innerText = "Area:";
            let S = getArea(points.get(0), points.get(points.length - 1));
            if (S >= 1000000) {
              value.innerText = (S / 1000000).toFixed(1) + " км²";
            } else {
              value.innerText = S.toFixed(1) + " м²";
            }
            break;
          default:
            break;
        }
      }
    };
  })
  .otherwise(function (error) {
    console.log(error);
  });

var points = scene.primitives.add(new Cesium.PointPrimitiveCollection());
var polylines = scene.primitives.add(new Cesium.PolylineCollection());
var LINEPOINTCOLOR = Cesium.Color.RED;

function drawLine(point1, point2) {
  let point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
  let point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);

  var pl1Positions = [
    new Cesium.Cartesian3.fromRadians(
      point1GeoPosition.longitude,
      point1GeoPosition.latitude,
      point1GeoPosition.height
    ),
    new Cesium.Cartesian3.fromRadians(
      point2GeoPosition.longitude,
      point2GeoPosition.latitude,
      point2GeoPosition.height
    ),
  ];

  polylines.add({
    show: true,
    positions: pl1Positions,
    width: 1,
    material: new Cesium.Material({
      fabric: {
        type: "Color",
        uniforms: {
          color: LINEPOINTCOLOR,
        },
      },
    }),
  });
}

function drawHorizontalLine(point1, point2) {
  let point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
  let point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);

  var pl3Positions = [
    new Cesium.Cartesian3.fromRadians(
      point1GeoPosition.longitude,
      point1GeoPosition.latitude,
      point1GeoPosition.height
    ),
    new Cesium.Cartesian3.fromRadians(
      point2GeoPosition.longitude,
      point2GeoPosition.latitude,
      point1GeoPosition.height
    ),
  ];

  polylines.add({
    show: true,
    positions: pl3Positions,
    width: 1,
    material: new Cesium.Material({
      fabric: {
        type: "PolylineDash",
        uniforms: {
          color: LINEPOINTCOLOR,
        },
      },
    }),
  });
}

function drawVerticalLine(point1, point2) {
  let point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
  let point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);

  var pl2Positions = [
    new Cesium.Cartesian3.fromRadians(
      point2GeoPosition.longitude,
      point2GeoPosition.latitude,
      point2GeoPosition.height
    ),
    new Cesium.Cartesian3.fromRadians(
      point2GeoPosition.longitude,
      point2GeoPosition.latitude,
      point1GeoPosition.height
    ),
  ];

  polylines.add({
    show: true,
    positions: pl2Positions,
    width: 1,
    material: new Cesium.Material({
      fabric: {
        type: "PolylineDash",
        uniforms: {
          color: LINEPOINTCOLOR,
        },
      },
    }),
  });
}

function preprocessPoints(point1, point2) {
  point1.cartographic = ellipsoid.cartesianToCartographic(point1.position);
  point2.cartographic = ellipsoid.cartesianToCartographic(point2.position);
  point1.longitude = parseFloat(Cesium.Math.toDegrees(point1.position.x));
  point1.latitude = parseFloat(Cesium.Math.toDegrees(point1.position.y));
  point2.longitude = parseFloat(Cesium.Math.toDegrees(point2.position.x));
  point2.latitude = parseFloat(Cesium.Math.toDegrees(point2.position.y));
}

function getDistance(point1, point2) {
  preprocessPoints(point1, point2);

  geodesic.setEndPoints(point1.cartographic, point2.cartographic);
  var horizontalMeters = geodesic.surfaceDistance.toFixed(2);

  let point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
  let point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);
  var heights = [point1GeoPosition.height, point2GeoPosition.height];
  var verticalMeters =
    Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
  var meters = Math.pow(
    Math.pow(horizontalMeters, 2) + Math.pow(verticalMeters, 2),
    0.5
  );
  return meters;
}

function getHorizontalDistance(point1, point2) {
  preprocessPoints(point1, point2);
  geodesic.setEndPoints(point1.cartographic, point2.cartographic);
  var meters = geodesic.surfaceDistance;
  return meters;
}

function getVerticalDistance(point1, point2) {
  preprocessPoints(point1, point2);
  let point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
  let point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);
  var heights = [point1GeoPosition.height, point2GeoPosition.height];
  var meters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
  return meters;
}

function getArea(point1, point2) {
  preprocessPoints(point1, point2);
  let point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
  let point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);

  var heights = [point1GeoPosition.height, point2GeoPosition.height];
  var S =
    Math.abs(
      point1.longitude * (point2.latitude - point2GeoPosition.height) +
      point2.longitude * (point2GeoPosition.height - point1.latitude) +
      point1GeoPosition.height * (point1.latitude - point2.latitude)
    ) * 0.5;
  return S;
}
var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
handler.setInputAction(function (click) {
  if (scene.mode !== Cesium.SceneMode.MORPHING) {
    var pickedObject = scene.pick(click.position);
    if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
      var cartesian = viewer.scene.pickPosition(click.position);

      if (Cesium.defined(cartesian)) {
        if (points.length < 2) {
          points.add({
            position: new Cesium.Cartesian3(
              cartesian.x,
              cartesian.y,
              cartesian.z
            ),
            color: LINEPOINTCOLOR,
          });
          updateValue();
        }
      }
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
