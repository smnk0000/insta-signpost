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
    :ll => "#{params[:lat]},#{params[:lng]}",
    :radius => 10000,
    :limit => 50,
    :intent => "browse",
    :categoryId => "4bf58dd8d48988d1e1931735"
  )
  return results[:venues].to_json
end