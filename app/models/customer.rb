class Customer < ApplicationRecord
  # Virtual associations to MongoDB
  def invoices
    Invoice.where(customer_id: id)
  end
  
  def mailing_documents
    MailingDocument.where(customer_id: id)
  end
  
  # Regular ActiveRecord associations
  has_many :invoices
  
  validates :name, presence: true
  validates :email, presence: true
  validates :address, presence: true
  validates :phone, presence: true
end
