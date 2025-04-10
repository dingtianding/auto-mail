class InvoiceDocument
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :invoice_id, type: Integer
  field :pdf_data, type: BSON::Binary
  field :filename, type: String
  
  validates :invoice_id, presence: true
  validates :pdf_data, presence: true
  
  def store_pdf(pdf_file)
    self.pdf_data = BSON::Binary.new(pdf_file.read)
    self.filename = "invoice_#{invoice_id}.pdf"
    save
  end
  
  def pdf_content
    pdf_data.data
  end
end 