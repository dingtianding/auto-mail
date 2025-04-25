module Api
  class InvoicesController < Api::BaseController
    before_action :set_invoice, only: [:show, :pdf, :download]
    
    def index
      @invoices = Invoice.all.order(created_at: :desc)
      render json: { success: true, data: @invoices }
    end
    
    def show
      render json: { success: true, data: @invoice.as_json(include: :line_items) }
    end
    
    def pdf
      respond_to_pdf
    end
    
    def download
      respond_to_pdf(disposition: 'attachment')
    end
    
    private
    
    def set_invoice
      @invoice = Invoice.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { success: false, error: 'Invoice not found' }, status: :not_found
    end
    
    def respond_to_pdf(disposition: 'inline')
      # Check if we already have a cached PDF
      pdf_path = Rails.root.join('tmp', "invoice_#{@invoice.id}.pdf")
      
      # Generate PDF if it doesn't exist or is older than the invoice
      if !File.exist?(pdf_path) || File.mtime(pdf_path) < @invoice.updated_at
        generate_pdf(pdf_path)
      end
      
      if File.exist?(pdf_path)
        send_file pdf_path, 
                  type: 'application/pdf', 
                  disposition: disposition,
                  filename: "invoice_#{@invoice.invoice_number || @invoice.id}.pdf"
      else
        render json: { success: false, error: 'PDF generation failed' }, status: :internal_server_error
      end
    end
    
    def generate_pdf(output_path)
      begin
        # Create a temporary JSON file with invoice data
        json_path = Rails.root.join('tmp', "invoice_#{@invoice.id}.json")
        
        # Get customer data
        customer = @invoice.customer
        
        # Prepare invoice data
        invoice_data = @invoice.as_json(include: :line_items)
        invoice_data['customer'] = customer.as_json
        
        # Write to JSON file
        File.write(json_path, invoice_data.to_json)
        
        # Call Python script to generate PDF
        python_script = Rails.root.join('python', 'generate_invoice.py')
        system("python3 #{python_script} #{json_path} #{output_path}")
        
        # Clean up JSON file
        File.delete(json_path) if File.exist?(json_path)
        
        return File.exist?(output_path)
      rescue => e
        Rails.logger.error("PDF generation error: #{e.message}")
        return false
      end
    end
  end
end 