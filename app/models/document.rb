class Document
  include Mongoid::Document
  include Mongoid::Timestamps

  field :content, type: String
  field :status, type: String, default: 'pending'
  field :pdf_url, type: String
  field :customer_id, type: Integer  # Reference to PostgreSQL customer

  # Validations
  validates :customer_id, presence: true
  validates :content, presence: true

  # Helper method to get associated customer from PostgreSQL
  def customer
    Customer.find_by(id: customer_id)
  end

  def pdf_url
    # Add your PDF URL logic here
    nil
  end
end 