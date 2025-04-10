class MailingDocumentsController < ApplicationController
  def create
    @customer = Customer.find(params[:customer_id])
    
    @document = MailingDocument.new(
      customer_id: @customer.id,
      content: params[:content] || "Default letter content",
      status: 'processing'
    )
    
    if @document.save
      # Generate PDF
      begin
        pdf_path = PdfGeneratorService.generate_for_customer(@customer, @document.content)
        @document.update(
          status: 'completed',
          pdf_path: pdf_path
        )
        redirect_to customer_path(@customer), notice: 'Letter generated successfully!'
      rescue => e
        @document.update(status: 'failed')
        redirect_to customer_path(@customer), alert: 'PDF generation failed.'
      end
    else
      redirect_to customer_path(@customer), alert: 'Could not create document.'
    end
  end

  def show
  end
end
