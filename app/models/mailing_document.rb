class MailingDocument
  include Mongoid::Document
  include Mongoid::Timestamps

  field :content, type: String
  field :status, type: String, default: 'pending'
  field :customer_id, type: Integer  # Reference to ActiveRecord Customer
  field :pdf_data, type: BSON::Binary
  field :filename, type: String

  STATUSES = %w[pending processing completed failed]

  validates :customer_id, presence: true
  validates :content, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES }

  scope :pending, -> { where(status: 'pending') }
  scope :completed, -> { where(status: 'completed') }
  scope :failed, -> { where(status: 'failed') }

  # Get associated customer from PostgreSQL
  def customer
    Customer.find(customer_id)
  end

  def store_pdf(pdf_file)
    return unless pdf_file
    
    begin
      self.pdf_data = BSON::Binary.new(pdf_file.read)
      self.filename = "document_#{id}.pdf"
      self.status = 'completed'
      save!
      Rails.logger.info "PDF stored successfully for document #{id}"
    rescue => e
      Rails.logger.error "Failed to store PDF for document #{id}: #{e.message}"
      self.status = 'failed'
      save
      raise e
    end
  end

  def pdf_content
    return nil unless pdf_data
    pdf_data.data
  rescue => e
    Rails.logger.error "Failed to retrieve PDF content for document #{id}: #{e.message}"
    nil
  end

  def pdf_url
    return nil unless pdf_data.present?
    "/api/customers/#{customer_id}/documents/#{id}/download"
  end

  def status_color
    case status
    when 'completed' then 'success'
    when 'processing' then 'warning'
    when 'failed' then 'danger'
    else 'secondary'
    end
  end

  def status_label
    status.titleize
  end
end 