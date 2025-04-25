class MailingDocumentsController < ApplicationController
  before_action :set_customer
  before_action :set_document, only: [:show, :preview, :regenerate, :download]

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
        content = @document.pdf_data
        if content.present?
          disposition = params[:disposition] == 'attachment' ? 'attachment' : 'inline'
          filename = @document.filename || "document_#{@document.id}.pdf"
          
          Rails.logger.info "Sending PDF for document #{@document.id}"
          
          send_data content.data,
            filename: filename,
            type: 'application/pdf',
            disposition: disposition
        else
          Rails.logger.warn "No PDF content for document #{@document.id}"
          respond_to do |format|
            format.html { redirect_to customer_path(@customer), alert: 'PDF is not available.' }
            format.json { render json: { error: 'PDF not available' }, status: :not_found }
          end
        end
      end
      format.json { render json: @document }
    end
  end

  def preview
    render layout: false
  end

  def regenerate
    @document.update(status: 'pending')
    GenerateDocumentPdfJob.perform_later(@document.id.to_s)
    
    respond_to do |format|
      format.html { 
        redirect_to customer_path(@customer), 
          notice: 'Document PDF is being regenerated.'
      }
      format.json { 
        render json: { message: 'PDF regeneration started' }, status: :ok 
      }
    end
  end

  def download
    content = @document.pdf_data
    if content.present?
      disposition = params[:disposition] == 'attachment' ? 'attachment' : 'inline'
      filename = @document.filename || "document_#{@document.id}.pdf"
      
      Rails.logger.info "Downloading PDF for document #{@document.id}"
      
      send_data content.data,
        filename: filename,
        type: 'application/pdf',
        disposition: disposition
    else
      Rails.logger.warn "No PDF content for document #{@document.id}"
      respond_to do |format|
        format.html { redirect_to customer_path(@customer), alert: 'PDF is not available.' }
        format.json { render json: { error: 'PDF not available' }, status: :not_found }
      end
    end
  end

  def show_pdf
    content = @document.pdf_data
    if content.present?
      send_data content.data,
        filename: "document_#{@document.id}.pdf",
        type: 'application/pdf',
        disposition: 'inline'
    else
      render json: { error: 'PDF not available' }, status: :not_found
    end
  end

  private

  def set_customer
    @customer = Customer.find(params[:customer_id])
  end

  def set_document
    @document = @customer.mailing_documents.find(params[:id])
  rescue Mongoid::Errors::DocumentNotFound
    respond_to do |format|
      format.html { redirect_to customer_path(@customer), alert: 'Document not found.' }
      format.json { render json: { error: 'Document not found' }, status: :not_found }
    end
  end

  def document_params
    params.require(:mailing_document).permit(:content)
  end
end
