module Api
  class DocumentsController < Api::BaseController
    def create
      @customer = Customer.find(params[:customer_id])
      @document = Document.new(document_params)
      @document.customer_id = @customer.id
      
      if @document.save
        render_success(@document)
      else
        render_error(@document.errors.full_messages)
      end
    rescue ActiveRecord::RecordNotFound
      render_error("Customer not found", :not_found)
    end

    private

    def document_params
      params.require(:document).permit(:content)
    end
  end
end 