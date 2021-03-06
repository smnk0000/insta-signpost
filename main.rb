require "sinatra"
require "instagram"
require "foursquare2"
require "httpclient"
require "json"

require "sinatra/reloader" if development?
require "pp"

configure do
  # ロケタッチAPIのエンドポイントを指定
  API_ENDPOINT = "http://api.gourmet.livedoor.com/v1.0/restaurant/"
end

# TOPページアクセス時の処理
get "/" do
  @title = "CafeStagram"
  erb :index
end

# 現在地近辺のスポットを検索しjsonで返す
get "/venues.json" do
  content_type :json
  #Foursquareのクライアント割当
  fsq_client = Foursquare2::Client.new(
    :client_id => ENV["FOURSQUARE_CLIENT_ID"],
    :client_secret => ENV["FOURSQUARE_CLIENT_SECRET"],
    :locale => "ja",
    :api_version => "20141224"
  )
  # 近くのスポットを検索する
  results = fsq_client.search_venues(
    :ll => "#{params[:lat]},#{params[:lng]}", # 緯度・経度の指定
    :radius => 1000,                          # 捜索範囲(m)
    :limit => 50,                             # 件数
    :intent => "browse",                      #
    :categoryId => "4bf58dd8d48988d128941735,4bf58dd8d48988d16d941735" # カテゴリ(カフェテリア、カフェ)
  )
  return results[:venues].to_json
end

# Instagramより指定したvenueIdの写真を取得する
get "/media.json" do
  response = {}
  content_type :json
  #Instagramクライアント定義
  Instagram.configure do |config|
    config.client_id = ENV["INSTAGRAM_CLIENT_ID"]
    config.client_secret = ENV["INSTAGRAM_CLIENT_SECRET"]
  end
  client = Instagram.client()
  # 4sq_locationIDをinsta_locationIDに変換
  location = client.location_search(params[:id])
  if location.length != 0
    # 該当locationのメディアデータを取得
    medias = client.location_recent_media(location[0][:id])
    response = medias
  end
  return response.to_json
end

# ロケタッチAPIより指定した店舗の営業時間等の情報を取得する
get "/shop_inf.json" do
  content_type :json
  http_client = HTTPClient.new
  response = http_client.get API_ENDPOINT,
                             {"api_key" => ENV["LOCATOUCH_API_KEY"],
                              "type" => "json",
                              "name" => "#{params[:name].to_s}",
                              "address" => "#{params[:address].to_s}"}
  return response.body
end
