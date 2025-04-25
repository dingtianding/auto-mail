class Customer < ApplicationRecord
  # Virtual associations to MongoDB
  def invoices
    Invoice.where(customer_id: id)
  end
  
  def mailing_documents
    MailingDocument.where(customer_id: id)
  end
  
  # Regular ActiveRecord associations
  # has_many :documents  # This is causing the error
  
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :address, presence: true
  validates :phone, presence: true

  # Helper method to get MongoDB documents
  def documents
    Document.where(customer_id: id)
  end

  def self.to_csv
    attributes = %w{id name email address phone}
    
    CSV.generate(headers: true) do |csv|
      csv << attributes
      
      all.each do |customer|
        csv << attributes.map{ |attr| customer.send(attr) }
      end
    end
  end

  has_many :invoices
end
