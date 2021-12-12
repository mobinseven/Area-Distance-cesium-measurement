// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YTE2N2U2NS0xOWY4LTRhNjktODk0Yi04ZjlhNjBjYWYyM2UiLCJpZCI6NzU2NzksImlhdCI6MTYzODgwOTE0Mn0.YxXpqexwYFvu54l-OXqLiZGDyhGFMUM3r8AuSywxY44";

var viewer = new Cesium.Viewer("cesiumContainer"); //Default 
//  such as measurement was added
//var viewer = new Cesium.Viewer("cesiumContainer", {
 // terrainProvider: Cesium.createWorldTerrain(),
//});

// from measurement added these 5 lines 
var camera = viewer.camera;
var scene = viewer.scene;
var globe = scene.globe;
var ellipsoid = Cesium.Ellipsoid.WGS84;
var geodesic = new Cesium.EllipsoidGeodesic();

// subtle difference with classification and measurement
// there is no viewer in measurement but in classification
var tileset = scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(698541),
  })
);

tileset.readyPromise
  .then(function () {
    viewer.zoomTo(tileset); 
      var boundingSphere = tileset.boundingSphere;
      camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.5, -0.2, boundingSphere.radius * 4.0));
      camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  

  
  })
  .otherwise(function (error) {
    console.log(error);
    //throw(error); measurement code had this one
  });




// from here was empty here and replaced from measurement code


   tileset.allTilesLoaded.addEventListener(function() {
      console.log('All tiles are loaded');
   });
   

    var points = scene.primitives.add(new Cesium.PointPrimitiveCollection());
    var point1, point2;
    var horizontalMeters, verticalMeters, meters;
    var point1GeoPosition, point2GeoPosition, point3GeoPosition;
    var polylines = scene.primitives.add(new Cesium.PolylineCollection());
    var polyline1, polyline2, polyline3;
    var distanceLabel, verticalLabel, horizontalLabel, areaLabel;
    var LINEPOINTCOLOR = Cesium.Color.RED;
    var labels = scene.primitives.add(new Cesium.LabelCollection());
    var areapart;
  


    var label = {
      font : '14px monospace',
      showBackground : true,
      horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
      verticalOrigin : Cesium.VerticalOrigin.CENTER,
      pixelOffset : new Cesium.Cartesian2(0, 0),
      eyeOffset: new Cesium.Cartesian3(0,0,-50),
      fillColor: Cesium.Color.WHITE,
    };








// these codes are for showing the distance and points on the screen 

    function addDistanceLabel(point1, point2, height) {
      point1.cartographic = ellipsoid.cartesianToCartographic(point1.position);
      point2.cartographic = ellipsoid.cartesianToCartographic(point2.position);
      point1.longitude = parseFloat(Cesium.Math.toDegrees(point1.position.x));
      point1.latitude = parseFloat(Cesium.Math.toDegrees(point1.position.y));
      point2.longitude = parseFloat(Cesium.Math.toDegrees(point2.position.x));
      point2.latitude = parseFloat(Cesium.Math.toDegrees(point2.position.y));
      label.text = getHorizontalDistanceString(point1, point2);
      horizontalLabel = viewer.entities.add({
          position: getMidpoint(point1, point2, point1GeoPosition.height),
          label: label
      });
      label.text = getDistanceString(point1, point2);
      distanceLabel = viewer.entities.add({
          position: getMidpoint(point1, point2, height),
          label: label
      });

      
      label.text = getareaString(point1, point2);     //Area label, distancelabel here should be changed
      distanceLabel = viewer.entities.add({
          position: getMidpoint(point1, point2, point2GeoPosition.height),
          label: label
      });

      
      
      label.text = getVerticalDistanceString();
      verticalLabel = viewer.entities.add({
          position: getMidpoint(point2, point2, height),
          label: label
      });
    }




//until here



    function getHorizontalDistanceString(point1, point2) {
      geodesic.setEndPoints(point1.cartographic, point2.cartographic);
      var meters = geodesic.surfaceDistance.toFixed(2);
      if (meters >= 1000) {
          return (meters / 1000).toFixed(1) + ' км';
      }
      return meters + ' м';
    }


    function getVerticalDistanceString() {
      var heights = [point1GeoPosition.height, point2GeoPosition.height];
      var meters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
      if (meters >= 1000) {
          return (meters / 1000).toFixed(1) + ' км';
      }
      return meters.toFixed(2) + ' м';
    }



    function getDistanceString(point1, point2) {
      geodesic.setEndPoints(point1.cartographic, point2.cartographic);
      var horizontalMeters = geodesic.surfaceDistance.toFixed(2);
      var heights = [point1GeoPosition.height, point2GeoPosition.height];
      var verticalMeters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
      var meters = Math.pow((Math.pow(horizontalMeters, 2) + Math.pow(verticalMeters, 2)), 0.5);
    
      
      if (meters >= 1000) {
          return (meters / 1000).toFixed(1) + ' км';
      }
      return meters.toFixed(2) + ' м';
    }

    // area calculation
    //function getareaString(point1, point2) {
      //var heights = [point1GeoPosition.height, point2GeoPosition.height];
      //var S = Math.abs( point1.longitude*(point2.latitude - point2GeoPosition.height)+ point2.longitude*(point2GeoPosition.height - point1.latitude) + point1GeoPosition.height*(point1.latitude - point2.latitude) )* 0.5;

            
      //if (S >= 1000000) {
        //  return (S / 1000000).toFixed(1) + '   Square Meter';
      //}
      
      //return S + 'square meter';
      //return S.toFixed(1) + '    Square Meter ';
    //}






    function getareaString(point1, point2) {
      geodesic.setEndPoints(point1.cartographic, point2.cartographic);
      var horizontalMeters = geodesic.surfaceDistance.toFixed(2);
      var heights = [point1GeoPosition.height, point2GeoPosition.height];
      var verticalMeters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
      var S = (horizontalMeters*verticalMeters)*0.5 ;
    
      
      if (S >= 1000000) {
          return (S / 1000000).toFixed(1) + ' м^2';
      }
      return S.toFixed(2) + ' м^2';
    }




//until here

    function getMidpoint(point1, point2, height) {
      var scratch = new Cesium.Cartographic();
      geodesic.setEndPoints(point1.cartographic, point2.cartographic);
      var midpointCartographic = geodesic.interpolateUsingFraction(0.5, scratch);
      return Cesium.Cartesian3.fromRadians(midpointCartographic.longitude, midpointCartographic.latitude, height);
    }




      // this is the code for UI, added by me only tested for distance
      document.getElementById("distance").addEventListener("click", getDistanceString);
     
     //mouseHandler.selectgetDistanceString                                             
    // Mouse over the globe to see the cartographic position
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(click) {
        if (scene.mode !== Cesium.SceneMode.MORPHING) {
            var pickedObject = scene.pick(click.position);
            if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                var cartesian = viewer.scene.pickPosition(click.position);
                // console.log(cartesian);
                if (Cesium.defined(cartesian)) {
                    if (points.length === 2) {
                        points.removeAll();
                        polylines.removeAll();
                        viewer.entities.remove(distanceLabel);
                        viewer.entities.remove(horizontalLabel);
                        viewer.entities.remove(verticalLabel);
                    }
                    //add first point
                    if (points.length === 0) {
                        point1 = points.add({
                            position : new Cesium.Cartesian3(cartesian.x, cartesian.y, cartesian.z),
                            color : LINEPOINTCOLOR
                        });
                    } //add second point and lines
                    else if (points.length === 1) {
                        point2 = points.add({
                            position : new Cesium.Cartesian3(cartesian.x, cartesian.y, cartesian.z),
                            color : LINEPOINTCOLOR
                        }); 
                        point1GeoPosition = Cesium.Cartographic.fromCartesian(point1.position);
                        point2GeoPosition = Cesium.Cartographic.fromCartesian(point2.position);
                        point3GeoPosition = Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(point2.position.x, point2.position.y, point1.position.z));  

                        var pl1Positions = [
                          new Cesium.Cartesian3.fromRadians(point1GeoPosition.longitude, point1GeoPosition.latitude, point1GeoPosition.height),
                          new Cesium.Cartesian3.fromRadians(point2GeoPosition.longitude, point2GeoPosition.latitude, point2GeoPosition.height)
                        ];
                        var pl2Positions = [
                          new Cesium.Cartesian3.fromRadians(point2GeoPosition.longitude, point2GeoPosition.latitude, point2GeoPosition.height),
                          new Cesium.Cartesian3.fromRadians(point2GeoPosition.longitude, point2GeoPosition.latitude, point1GeoPosition.height)
                        ];
                        var pl3Positions = [
                          new Cesium.Cartesian3.fromRadians(point1GeoPosition.longitude, point1GeoPosition.latitude, point1GeoPosition.height),
                          new Cesium.Cartesian3.fromRadians(point2GeoPosition.longitude, point2GeoPosition.latitude, point1GeoPosition.height)
                        ];

                        polyline1 = polylines.add({
                          show : true,
                          positions : pl1Positions,
                          width : 1,
                          material: new Cesium.Material({
                              fabric : {
                                  type : 'Color',
                                  uniforms : {
                                      color : LINEPOINTCOLOR
                                  }
                              }
                          })
                        }); 
                        polyline2 = polylines.add({
                          show : true,
                          positions : pl2Positions,
                          width : 1,
                          material: new Cesium.Material({
                              fabric : {
                                  type : 'PolylineDash',
                                  uniforms : {
                                      color : LINEPOINTCOLOR,
                                  }
                              },
                          })
                        });
                        polyline3 = polylines.add({
                          show : true,
                          positions : pl3Positions,
                          width : 1,
                          material: new Cesium.Material({
                              fabric : {
                                  type : 'PolylineDash',
                                  uniforms : {
                                      color : LINEPOINTCOLOR,
                                  }
                              },
                          })
                        }); 
                      
                          //areapart added by me
                      
                          areapart = labels.add({
                          show : true,
                          positions : pl3Positions+200,
                          width : 1,
                          //material: new Cesium.Material({
                            //  fabric : {
                              //    type : 'PolylineDash',
                                //  uniforms : {
                                  //    color : LINEPOINTCOLOR,
                                  //}
                              //},
                         // })
                        });
                      
                      
                        var labelZ;
                        if (point2GeoPosition.height >= point1GeoPosition.height) {
                          labelZ = point1GeoPosition.height + (point2GeoPosition.height - point1GeoPosition.height)/2.0;
                        } else {
                          labelZ = point2GeoPosition.height + (point1GeoPosition.height - point2GeoPosition.height)/2.0;
                        }
                        

                        addDistanceLabel(point1, point2, labelZ);
                      
                        // this is the code for UI, added by me only tested for distance
                        //document.getElementById("distance").addEventListener("click", getDistanceString);

                    }
                    
                  
                  
                  
                   
                    
                    
                    
                  
                }
            }
        }
   
    
    
    
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
