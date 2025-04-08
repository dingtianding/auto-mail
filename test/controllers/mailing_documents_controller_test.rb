require "test_helper"

class MailingDocumentsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get mailing_documents_create_url
    assert_response :success
  end

  test "should get show" do
    get mailing_documents_show_url
    assert_response :success
  end
end
