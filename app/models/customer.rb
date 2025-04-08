class Customer < ApplicationRecord
  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  
  # Helper method to find associated mailing documents
  def mailing_documents
    MailingDocument.where(customer_id: id)
  end
end
