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

  // 4sqより取得した位置情報のマーカーを表示
  for (var i=0;i<venues.length;i++) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(venues[i].location.lat, venues[i].location.lng),
      map: map,
      icon: venues[i].categories[0].icon.prefix + "bg_32" + venues[i].categories[0].icon.suffix,
      title: venues[i].name
    });
    attachMessage(marker, venues[i].name, venues[i].id);
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
