class GenerateInvoicePdfJob < ApplicationJob
  queue_as :default

  def perform(invoice_id)
    invoice = Invoice.find(invoice_id)
    
    # Prepare data for Python script
    data = {
      invoice_number: invoice.invoice_number,
      date: invoice.created_at.strftime('%B %d, %Y'),
      due_date: invoice.due_date.strftime('%B %d, %Y'),
      customer: {
        name: invoice.customer.name,
        address: invoice.customer.address,
        email: invoice.customer.email,
        phone: invoice.customer.phone
      },
      line_items: invoice.line_items.map { |item|
        {
          service: item.service,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          total: item.total
        }
      },
      subtotal: invoice.subtotal,
      tax_rate: invoice.tax_rate,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      notes: invoice.notes
    }

    # Write data to temp JSON file
    temp_file = Tempfile.new(['invoice_data', '.json'])
    temp_file.write(data.to_json)
    temp_file.close

    # Generate PDF using Python script
    output_path = Rails.root.join('tmp', "invoice_#{invoice.id}.pdf")
    
    system(
      "python3",
      Rails.root.join('python', 'generate_invoice.py').to_s,
      temp_file.path,
      output_path.to_s
    )

    # Store PDF in MongoDB if generation successful
    if File.exist?(output_path)
      document = InvoiceDocument.new(invoice_id: invoice.id)
      document.store_pdf(File.open(output_path))
      
      # Cleanup temp files
      temp_file.unlink
      File.delete(output_path)
    else
      raise "PDF generation failed"
    end
  end
end 