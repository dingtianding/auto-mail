class MailingDocument
  include Mongoid::Document
  include Mongoid::Timestamps

  field :content, type: String
  field :customer_id, type: Integer
  field :status, type: String, default: 'pending'
  field :pdf_path, type: String

  validates :customer_id, presence: true
  validates :content, presence: true

  # Helper method to find associated customer
  def customer
    Customer.find_by(id: customer_id)
  end
end 