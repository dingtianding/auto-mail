class LineItem < ApplicationRecord
  belongs_to :invoice
  
  validates :service, presence: true
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :rate, presence: true, numericality: { greater_than: 0 }
  
  def total
    quantity * rate
  end
end 