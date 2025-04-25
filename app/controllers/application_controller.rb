class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  skip_before_action :verify_authenticity_token, if: :json_request?
  
  protected
  
  def json_request?
    request.format.json? || request.content_type == 'application/json'
  end
end
