// 現在地を取得する関数
function get_location() {
  if (navigator.geolocation) {
    // 位置情報取得可能な場合
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        // 位置情報取得に成功した場合
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        draw_map(lat, lng);
      },
      function(error) {
        // 位置情報取得に失敗した場合
      }
    );
  } else {
    // 位置情報取得不可の場合
  }
}

// Google Mapを表示する関数
function draw_map(lat, lng) {
  var mapOptions = {
    zoom: 18,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
}
