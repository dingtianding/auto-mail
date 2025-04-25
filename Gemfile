source "https://rubygems.org"
# Add near the top, after source
gem 'dotenv-rails', groups: [:development, :test]
# Core Rails gems
gem "rails", "~> 7.1.0"
gem "sprockets-rails"
gem "pg", "~> 1.1"  # Keep only this pg specification
gem "puma", ">= 5.0"
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "jbuilder"
gem "redis", ">= 4.0.1"

# Add these explicitly to fix the Logger issue
gem 'logger', '~> 1.5'
gem 'psych', '~> 5.0'

# MongoDB
gem 'mongoid', '~> 8.1.0'
gem 'mongo', '~> 2.21.0'  # Updated to available version

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]
gem "bootsnap", require: false

group :development, :test do
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
end

group :development do
  gem "web-console"
  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  # gem "rack-mini-profiler"
  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"
end 
gem "nokogiri", "~> 1.18"

gem "builder", "~> 3.3"

gem 'rack-cors'

# Add HTTParty for API requests
gem 'httparty'


