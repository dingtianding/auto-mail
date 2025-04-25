class Prompt < ApplicationRecord
  validates :name, presence: true
  validates :content, presence: true
  validates :category, presence: true
  
  enum category: {
    chat: 'chat',
    document_analysis: 'document_analysis',
    email: 'email',
    invoice: 'invoice',
    system: 'system'
  }
end 