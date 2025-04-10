require 'json'
require 'open3'

class PdfGeneratorService
  def self.generate_for_customer(customer, message)
    # Create temp JSON file with customer data
    data = {
      name: customer.name,
      address: customer.address,
      date: Time.current.strftime("%B %d, %Y"),
      message: message
    }
    
    json_file = Rails.root.join('tmp', "customer_#{customer.id}.json")
    pdf_file = Rails.root.join('public', 'pdfs', "letter_#{customer.id}.pdf")
    
    FileUtils.mkdir_p(Rails.root.join('public', 'pdfs'))
    
    File.write(json_file, data.to_json)
    
    # Call Python script
    script_path = Rails.root.join('python', 'generate_letter.py')
    command = "python3 #{script_path} #{json_file} #{pdf_file}"
    
    success = system(command)
    
    if success
      "/pdfs/letter_#{customer.id}.pdf"
    else
      raise "PDF generation failed"
    end
  ensure
    File.delete(json_file) if json_file && File.exist?(json_file)
  end
end 