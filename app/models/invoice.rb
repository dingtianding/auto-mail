class Invoice < ApplicationRecord
  belongs_to :customer
  has_many :line_items, dependent: :destroy
  
  validates :invoice_number, presence: true, uniqueness: true
  validates :customer_id, presence: true
  validates :issue_date, presence: true
  validates :due_date, presence: true
  validates :status, presence: true
  
  # Add PDF storage columns
  has_one_attached :pdf_file
  
  validates :tax_rate, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  accepts_nested_attributes_for :line_items, 
    allow_destroy: true, 
    reject_if: :all_blank
  
  before_validation :set_default_tax_rate
  before_validation :generate_invoice_number
  before_save :calculate_totals
  
  scope :recent, -> { order(created_at: :desc).limit(5) }
  
  # Custom method to find associated MongoDB document
  def invoice_document
    InvoiceDocument.where(invoice_id: id).first
  end
  
  def pdf_content
    pdf_file.download if pdf_file.attached?
  end
  
  def store_pdf(pdf_file)
    self.pdf_file.attach(
      io: pdf_file,
      filename: "invoice_#{invoice_number}.pdf",
      content_type: 'application/pdf'
    )
  end
  
  def status_color
    case status
    when 'paid' then 'success'
    when 'pending' then 'warning'
    when 'overdue' then 'danger'
    else 'secondary'
    end
  end
  
  def status_label
    status.presence || 'pending'
  end
  
  def generate_pdf
    # Generate PDF using the invoice Python script
    temp_file = Tempfile.new(['invoice_data', '.json'])
    begin
      data = {
        invoice_number: invoice_number,
        date: issue_date.strftime("%B %d, %Y"),
        due_date: due_date.strftime("%B %d, %Y"),
        customer: {
          name: customer.name,
          address: customer.address,
          email: customer.email
        },
        line_items: line_items.map { |item| 
          {
            service: item.service,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            total: item.total
          }
        },
        subtotal: subtotal,
        tax_rate: tax_rate,
        tax_amount: tax_amount,
        total_amount: total_amount,
        notes: notes
      }
      
      temp_file.write(data.to_json)
      temp_file.close
      
      output_path = Rails.root.join('tmp', "invoice_#{invoice_number}.pdf")
      
      success = system(
        "python3",
        Rails.root.join('python', 'generate_invoice.py').to_s,
        temp_file.path,
        output_path.to_s
      )
      
      if success && File.exist?(output_path)
        pdf_file.attach(
          io: File.open(output_path),
          filename: "invoice_#{invoice_number}.pdf",
          content_type: 'application/pdf'
        )
        File.delete(output_path)
      end
    ensure
      temp_file.unlink
    end
  end
  
  private
  
  def set_default_tax_rate
    self.tax_rate ||= 0.08
  end
  
  def generate_invoice_number
    return if invoice_number.present?
    year = Time.current.year
    count = Invoice.where(created_at: Time.current.beginning_of_year..Time.current.end_of_year).count + 1
    self.invoice_number = "INV-#{year}-#{count.to_s.rjust(4, '0')}"
  end
  
  def calculate_totals
    self.subtotal = line_items.sum(&:total)
    self.tax_amount = subtotal * tax_rate
    self.total_amount = subtotal + tax_amount
  end
end 