require "foursquare2"
require "instagram"
require "dotenv"
require "pp"

Dotenv.load ".env"

# 引数:parent_categoriesで与えられたサブカテゴリを取得する関数
def get_subcategories(parent_categories, space)
  parent_categories.each do |categorie|
    puts "#{Array.new(space, " ").join}id => #{categorie[:id]}, name => #{categorie[:name]}, pluralName => #{categorie[:pluralName]}, shortName => #{categorie[:shortName]}"
    unless categorie[:categories].nil?
      get_subcategories(categorie[:categories], space + 2)
    end
  end
end

# メイン処理
Instagram.configure do |config|
  config.client_id = ENV["INSTAGRAM_CLIENT_ID"]
  config.client_secret = ENV["INSTAGRAM_CLIENT_SECRET"]
end

fsq_client = Foursquare2::Client.new(
              :client_id => ENV["FOURSQUARE_CLIENT_ID"],
              :client_secret => ENV["FOURSQUARE_CLIENT_SECRET"],
              :locale => "ja",
              :api_version => "20141224"
            )

# スポットのカテゴリ情報を取得する
fsq_categories = fsq_client.venue_categories
get_subcategories(fsq_categories, 0)
puts "===================="

# 近くのスポットを検索する
results = fsq_client.search_venues(
            :ll => "34.7025018, 135.5531128",
            :radius => 10000,
            :limit => 50,
            :intent => "browse",
            :categoryId => "4bf58dd8d48988d128941735,4bf58dd8d48988d16d941735"
          )
results[:venues].each do |result|
#  puts "id => #{result[:id]}, name => #{result[:name]}, lat => #{result[:location][:lat]}, lng => #{result[:location][:lng]}"
#  result[:categories].each do |categorie|
#    puts "  cat_id => #{categorie[:id]}, cat_name => #{categorie[:name]}"
#  end

  client = Instagram.client()
  locations = client.location_search(result[:id])
  for location in locations
    medias = client.location_recent_media(location[:id])
    if medias.length != 0
#      pp medias
      puts "name => #{location[:name]}, id => #{location[:id]}, lat => #{location[:latitude]}, lng => #{location[:longitude]}"
      puts "===================="
      for media in medias
        #pp media
        puts "link => #{media[:link]}"
        puts "=========="
      end
    end
  end
end
