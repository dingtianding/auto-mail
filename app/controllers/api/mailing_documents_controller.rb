module Api
  class MailingDocumentsController < ::MailingDocumentsController
    # Inherits all actions from the main controller
    # but will handle /api routes
    
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
  end
end 