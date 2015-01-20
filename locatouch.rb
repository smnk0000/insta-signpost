require "httpclient"
require "dotenv"
require "json"
require "pp"

Dotenv.load ".env"

API_ENDPOINT = "http://api.gourmet.livedoor.com/v1.0/restaurant/"

http_client = HTTPClient.new

response = http_client.get API_ENDPOINT,
                          {"api_key" => ENV["LOCATOUCH_API_KEY"],
                           "type" => "json",
                           "name" => "coffee house SOL"}

pp JSON.parse(response.body)
