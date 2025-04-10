class GenerateDocumentPdfJob < ApplicationJob
  queue_as :default

  def perform(document_id)
    document = MailingDocument.find(document_id)
    document.update(status: 'processing')
    
    Rails.logger.info "Starting PDF generation for document #{document_id}"
    
    begin
      # Prepare data for Python script
      data = {
        name: document.customer.name,
        address: document.customer.address,
        message: document.content,
        date: Time.current.strftime('%B %d, %Y')
      }

      # Write data to temp JSON file
      temp_file = Tempfile.new(['document_data', '.json'])
      temp_file.write(data.to_json)
      temp_file.close

      # Generate PDF using Python script
      output_path = Rails.root.join('tmp', "document_#{document.id}.pdf")
      
      success = system(
        "python3",
        Rails.root.join('python', 'generate_letter.py').to_s,
        temp_file.path,
        output_path.to_s
      )

      if success && File.exist?(output_path)
        Rails.logger.info "PDF generated successfully for document #{document_id}"
        
        # Store PDF in MongoDB document
        document.store_pdf(File.open(output_path))
        
        # Cleanup temp files
        temp_file.unlink
        File.delete(output_path)
        
        Rails.logger.info "PDF process completed for document #{document_id}"
      else
        raise "PDF generation failed for document #{document_id}"
      end
      
    rescue => e
      Rails.logger.error "Error in PDF generation for document #{document_id}: #{e.message}"
      document.update(status: 'failed')
      raise e
    end
  end
end 