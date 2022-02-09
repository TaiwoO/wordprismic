require 'kramdown-prismic'
require 'json'

htmlTxt = File.read("./.tmp/html.txt")

parsed = Kramdown::Document.new(htmlTxt, input: :html).to_prismic
$stdout.puts parsed.to_json