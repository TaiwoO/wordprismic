require 'kramdown-prismic'
require 'json'

markdownTxt = File.read("./.tmp/markdown.txt")

parsed = Kramdown::Document.new(markdownTxt, input: :markdown).to_prismic
$stdout.puts parsed.to_json