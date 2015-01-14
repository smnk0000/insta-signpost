require "sinatra"
require "instagram"
require "foursquare2"
require "json"

require "sinatra/reloader" if development?
require "pp"

# TOPページアクセス時の処理
get "/" do
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
