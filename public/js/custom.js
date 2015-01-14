// グローバル変数
var infoWindow = null;

// 現在地を取得する
function get_location() {
  if (navigator.geolocation) {
    // 位置情報取得可能な場合
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        // 位置情報取得に成功した場合
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        //console.log("緯度 => " + lat + ", 経度 => " + lng);
        get_4sq_venues(lat, lng);
      },
      function(error) {
        // 位置情報取得に失敗した場合
      }
    );
  } else {
    // 位置情報取得不可の場合
  }
}

// 4sqより現在位置付近のvenueを取得する
function get_4sq_venues(lat, lng) {
  $.ajax({
    cache: false,
    type: "GET",
    url: "/venues.json",
    dataType: "json",
    data: {
      lat: lat,
      lng: lng
    }
  }).done(function(data){
    draw_map(lat, lng, data);   // Google Mapを表示
  }).fail(function(data){
    // ajax通信失敗時
  });
}

// Google Mapを表示する
function draw_map(lat, lng, venues) {
  var pos = new google.maps.LatLng(lat, lng);
  var mapOptions = {
    zoom: 16,
    center: pos,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

  // マーカーを表示
  var marker = new google.maps.Marker({
    position: pos,
    map: map,
    title: "現在地"
  });
  attachMessage(marker, "現在地");

  $("#venue_inf").empty();
  for (var i=0;i<venues.length;i++) {
    // 4sqより取得した位置情報のマーカーを表示
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(venues[i].location.lat, venues[i].location.lng),
      map: map,
      icon: venues[i].categories[0].icon.prefix + "bg_32" + venues[i].categories[0].icon.suffix,
      title: venues[i].name
    });
    attachMessage(marker, venues[i].name, venues[i].id);

    // 左側のカラムに取得したカフェの情報を表示
    var content = "";
    content += "<p>";
    content += "<img src=\"" + venues[i].categories[0].icon.prefix + "bg_32" + venues[i].categories[0].icon.suffix + "\">";
    content += venues[i].name + " (" + geoDistance(lat, lng, venues[i].location.lat, venues[i].location.lng, 1) + "m)";
    content += "</p>";
    $("#venue_inf").append(content);
  }
}

// InfoWindowを表示する
function attachMessage(marker, msg, venue_id){
  google.maps.event.addListener(marker, "click", function(event){
    if (infoWindow) {
      infoWindow.close();
    }
    infoWindow = new google.maps.InfoWindow({
                      content: msg
                    });
    infoWindow.open(marker.getMap(), marker);
    $("#insta_media").empty();
    if (msg != "現在地") {
      $.ajax({
        cache: false,
        type: "GET",
        url: "/media.json",
        dataType: "json",
        data: {
          id: venue_id
        }
      }).done(function(medias){
        var content = "";
        if (!(!medias.length)) {
          for (var media_cnt = 0; media_cnt < medias.length; media_cnt++) {
            content += "<a href=\"" + medias[media_cnt].link + "\" target=\"_blank\"><img src=\"" + medias[media_cnt].images.thumbnail.url + "\"></a>";
          }
        } else {
          content = "No Media";
        }
        $("#insta_media").append(content);
      }).fail(function(data){
        console.log("NG");
      });
    }
  });
}

//
// 測地線航海算法の公式
//
function geoDistance(lat1, lng1, lat2, lng2, precision) {
  // 引数　precision は小数点以下の桁数（距離の精度）
  var distance = 0;
  if ((Math.abs(lat1 - lat2) < 0.00001) && (Math.abs(lng1 - lng2) < 0.00001)) {
    distance = 0;
  } else {
    lat1 = lat1 * Math.PI / 180;
    lng1 = lng1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    lng2 = lng2 * Math.PI / 180;

    var A = 6378140;
    var B = 6356755;
    var F = (A - B) / A;

    var P1 = Math.atan((B / A) * Math.tan(lat1));
    var P2 = Math.atan((B / A) * Math.tan(lat2));

    var X = Math.acos(Math.sin(P1) * Math.sin(P2) + Math.cos(P1) * Math.cos(P2) * Math.cos(lng1 - lng2));
    var L = (F / 8) * ((Math.sin(X) - X) * Math.pow((Math.sin(P1) + Math.sin(P2)), 2) / Math.pow(Math.cos(X / 2), 2) - (Math.sin(X) - X) * Math.pow(Math.sin(P1) - Math.sin(P2), 2) / Math.pow(Math.sin(X), 2));

    distance = A * (X + L);
    var decimal_no = Math.pow(10, precision);
    distance = Math.round(decimal_no * distance / 1) / decimal_no;   // kmに変換するときは(1000で割る)
  }
  return distance;
}