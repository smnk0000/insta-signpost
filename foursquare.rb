require "foursquare2"
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
            :ll => "34.686316,135.519711",
            :radius => 10000,
            :limit => 50,
            :intent => "browse",
            :categoryId => "4bf58dd8d48988d1e1931735"
          )
results[:venues].each do |result|
#  pp result
  puts "name => #{result[:name]}, lat => #{result[:location][:lat]}, lng => #{result[:location][:lng]}"
  result[:categories].each do |categorie|
    puts "  cat_id => #{categorie[:id]}, cat_name => #{categorie[:name]}"
  end
end

puts results[:venues].size

