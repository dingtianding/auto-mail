class InvoicesController < ApplicationController
  before_action :set_customer
  before_action :set_invoice, only: [:show]

  def new
    @invoice = @customer.invoices.new
    @invoice.line_items.build # for nested form
  end

  def create
    @invoice = @customer.invoices.new(invoice_params)
    
    if @invoice.save
      # Generate PDF in background
      GenerateInvoicePdfJob.perform_later(@invoice.id)
      redirect_to customer_invoice_path(@customer, @invoice), 
                  notice: 'Invoice created successfully. PDF is being generated.'
    else
      render :new
    end
  end
  
  def show
    respond_to do |format|
      format.html
      format.pdf do
        Rails.logger.info "Starting PDF generation for invoice #{@invoice.invoice_number}"
        
        # Generate PDF data with proper number formatting
        data = {
          invoice_number: @invoice.invoice_number,
          date: @invoice.issue_date.strftime("%B %d, %Y"),
          due_date: @invoice.due_date.strftime("%B %d, %Y"),
          customer: {
            name: @customer.name,
            address: @customer.address,
            email: @customer.email
          },
          line_items: @invoice.line_items.map { |item| 
            {
              service: item.service.to_s,
              description: item.description.to_s,
              quantity: item.quantity.to_i,
              rate: item.rate.to_f,
              total: item.total.to_f
            }
          },
          subtotal: @invoice.subtotal.to_f,
          tax_rate: @invoice.tax_rate.to_f,
          tax_amount: @invoice.tax_amount.to_f,
          total_amount: @invoice.total_amount.to_f,
          notes: @invoice.notes.to_s
        }

        # Create temporary files with invoice number in name
        temp_json = Tempfile.new(["invoice_#{@invoice.invoice_number}", '.json'])
        temp_pdf = Tempfile.new(["invoice_#{@invoice.invoice_number}", '.pdf'])
        
        begin
          # Write JSON data
          temp_json.write(data.to_json)
          temp_json.close

          python_script = Rails.root.join('python', 'generate_invoice.py')
          Rails.logger.info "Using Python script at: #{python_script}"
          Rails.logger.info "JSON data at: #{temp_json.path}"
          Rails.logger.info "PDF output will be at: #{temp_pdf.path}"
          
          # Run Python script
          success = system("python3", python_script.to_s, temp_json.path, temp_pdf.path)
          Rails.logger.info "Python script execution #{success ? 'succeeded' : 'failed'}"
          
          if success && File.exist?(temp_pdf.path) && File.size(temp_pdf.path) > 0
            Rails.logger.info "PDF generated successfully at #{temp_pdf.path} with size #{File.size(temp_pdf.path)}"
            # Read the PDF content
            pdf_content = File.read(temp_pdf.path)
            
            # Send the PDF content with proper headers
            send_data pdf_content,
              filename: "invoice_#{@invoice.invoice_number}.pdf",
              type: 'application/pdf',
              disposition: 'inline'
          else
            error_message = "PDF generation failed for invoice #{@invoice.invoice_number}. Please try again."
            Rails.logger.error error_message
            redirect_to customer_path(@customer),
              alert: error_message
          end
        rescue => e
          Rails.logger.error "Error generating PDF for invoice #{@invoice.invoice_number}: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          redirect_to customer_path(@customer),
            alert: "Error generating PDF: #{e.message}"
        ensure
          # Clean up temp files
          temp_json.unlink
          temp_pdf.unlink
        end
      end
    end
  end
  
  def generate_pdf
    @invoice = @customer.invoices.find(params[:id])
    @invoice.generate_pdf
    redirect_to customer_path(@customer), notice: 'Invoice PDF is being generated.'
  end
  
  private
  
  def set_customer
    @customer = Customer.find(params[:customer_id])
  end

  def set_invoice
    @invoice = @customer.invoices.find(params[:id])
  end

  def invoice_params
    params.require(:invoice).permit(
      :due_date,
      :payment_terms,
      :tax_rate,
      :notes,
      line_items_attributes: [:service, :description, :quantity, :rate]
    )
  end
end 