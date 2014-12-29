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
        console.log("緯度 => " + lat + ", 経度 => " + lng);
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
    // ajax通信成功時
    for (var i=0;i<data.length;i++) {
      $("#venues").append((i+1) + " :: id => " + data[i].id + ", name => " + data[i].name + ", lat => " + data[i].location.lat + ", lng => " + data[i].location.lng + "<br />");
    }
    var medias = get_insta_media(data);
    draw_map(lat, lng, data, medias);   // Google Mapを表示
  }).fail(function(data){
    // ajax通信失敗時
  });
}

// Instagramよりvenueの写真を取得する
function get_insta_media(venues) {
  var medias = [];
  for (var i=0;i<venues.length;i++) {
    $.ajax({
      cache: false,
      type: "GET",
      url: "/media.json",
      dataType: "json",
      data: {
        id: venues[i].id
      },
      async: false
    }).done(function(data){
//      console.log(data);
      medias.push(data);
    }).fail(function(data){
      console.log("NG");
    });
  }
  return medias;
}

// Google Mapを表示する
function draw_map(lat, lng, data, medias) {
  var pos = new google.maps.LatLng(lat, lng);
  var mapOptions = {
    zoom: 14,
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

  // 4sqより取得した位置情報のマーカーを表示
  for (var i=0;i<data.length;i++) {
    if (!(!medias[i].length)) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(data[i].location.lat, data[i].location.lng),
        map: map,
        title: data[i].name
      });
      var content = "<div style=\"width : 435px;height : 325px;\">";
      content += "<p><h3>" + data[i].name + "</h3></p>";
      for (var media_cnt=0;media_cnt < medias[i].length;media_cnt++) {
        content += "<a href=\"" + medias[i][media_cnt].link + "\" target=\"_blank\"><img src=\"" + medias[i][media_cnt].images.thumbnail.url + "\"></a>";
      }
      content += "</div>";
      attachMessage(marker, content);
      console.log("name => " + data[i].name + ", lat => " + data[i].location.lat + ", lng =>" + data[i].location.lng + ", media_cnt => " + medias[i].length);
    }
  }
}

// InfoWindowを表示する
function attachMessage(marker, msg){
  google.maps.event.addListener(marker, "click", function(event){
    if (infoWindow) {
      infoWindow.close();
    }
    infoWindow = new google.maps.InfoWindow({
                      content: msg
                    });
    infoWindow.open(marker.getMap(), marker);
  });
}
