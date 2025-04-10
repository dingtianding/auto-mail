class MailingDocumentsController < ApplicationController
  before_action :set_customer
  before_action :set_document, only: [:show, :preview, :regenerate]

  def new
    @document = @customer.mailing_documents.new
  end

  def create
    @document = @customer.mailing_documents.new(document_params)
    
    if @document.save
      GenerateDocumentPdfJob.perform_later(@document.id.to_s)
      redirect_to customer_path(@customer), 
        notice: 'Document was successfully created. PDF is being generated.'
    else
      render :new
    end
  end

  def show
    respond_to do |format|
      format.html # show.html.erb for preview
      format.pdf do
        content = @document.pdf_content
        if content.present?
          disposition = params[:disposition] == 'attachment' ? 'attachment' : 'inline'
          filename = @document.filename || "document_#{@document.id}.pdf"
          
          Rails.logger.info "Sending PDF for document #{@document.id}, size: #{content.bytesize} bytes"
          
          send_data content,
            filename: filename,
            type: 'application/pdf',
            disposition: disposition
        else
          Rails.logger.warn "No PDF content for document #{@document.id}"
          redirect_to customer_path(@customer),
            alert: 'PDF is not available. Please try regenerating the document.'
        end
      end
    end
  end

  def preview
    render layout: false
  end

  def regenerate
    @document.update(status: 'pending')
    GenerateDocumentPdfJob.perform_later(@document.id.to_s)
    
    redirect_to customer_path(@customer), 
      notice: 'Document PDF is being regenerated.'
  end

  private

  def set_customer
    @customer = Customer.find(params[:customer_id])
  end

  def set_document
    @document = @customer.mailing_documents.find(params[:id])
  end

  def document_params
    params.require(:mailing_document).permit(:content)
  end
end
