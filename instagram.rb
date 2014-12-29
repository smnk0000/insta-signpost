require "instagram"
require "dotenv"
require "pp"

Dotenv.load ".env"

Instagram.configure do |config|
  config.client_id = ENV["INSTAGRAM_CLIENT_ID"]
  config.client_secret = ENV["INSTAGRAM_CLIENT_SECRET"]
end

client = Instagram.client()
for location in client.location_search("34.7025018", "135.5531128", "5000")
  medias = client.location_recent_media(location.id)
  if medias.length != 0
#    pp location
    puts "name => #{location[:name]}, id => #{location[:id]}, lat => #{location[:latitude]}, lng => #{location[:longitude]}"
    puts "===================="
    for media in medias
      puts media[:link]
      puts "=========="
    end
  end
end
