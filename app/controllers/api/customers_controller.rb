module Api
  class CustomersController < Api::BaseController
    def index
      @customers = Customer.all
      render_success(@customers)
    rescue => e
      Rails.logger.error "Error in index: #{e.message}"
      render_error(e.message)
    end

    def show
      @customer = Customer.find(params[:id])
      # Get MongoDB documents for this customer
      documents = MailingDocument.where(customer_id: @customer.id).map do |doc|
        {
          id: doc.id.to_s,  # MongoDB ID needs to be converted to string
          content: doc.content,
          status: doc.status,
          created_at: doc.created_at,
          pdf_url: doc.pdf_url,
          status_color: doc.status_color,
          status_label: doc.status_label
        }
      end

      customer_data = @customer.as_json.merge({
        documents: documents,
        invoices: @customer.invoices.order(created_at: :desc)
      })
      
      render_success(customer_data)
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "Customer not found: #{e.message}"
      render_error("Customer not found", :not_found)
    rescue => e
      Rails.logger.error "Error in show: #{e.message}"
      render_error(e.message)
    end

    def create
      @customer = Customer.new(customer_params)
      if @customer.save
        render_success(@customer, :created)
      else
        render_error(@customer.errors.full_messages, :unprocessable_entity)
      end
    end

    def import
      return render_error("No file uploaded", :unprocessable_entity) unless params[:file]

      begin
        file_content = File.read(params[:file].path)
        
        # Log the raw file content for debugging
        Rails.logger.info "Raw file content (first 200 chars): #{file_content[0..200]}..."
        
        # Detect file format based on content, not just extension
        format = detect_file_format(file_content, params[:file].original_filename)
        Rails.logger.info "Detected file format: #{format}"
        
        customers = parse_file_content(file_content, format)
        
        # Track import statistics
        stats = {
          total: customers.size,
          created: 0,
          updated: 0,
          failed: 0
        }

        # Log the parsed data
        Rails.logger.info "Parsed #{customers.size} customers from file"
        Rails.logger.info "First customer: #{customers.first.inspect}" if customers.any?

        # Process the customers
        customers.each do |customer_data|
          # Normalize keys to symbols and make them case-insensitive
          data = {}
          customer_data.each do |key, value|
            # Convert keys to lowercase for case-insensitivity
            normalized_key = key.to_s.downcase.to_sym
            data[normalized_key] = value
          end
          
          # Map common field variations
          field_mappings = {
            name: [:name, :customer_name, :fullname, :full_name],
            email: [:email, :email_address, :emailaddress],
            address: [:address, :street_address, :streetaddress, :location],
            phone: [:phone, :phone_number, :phonenumber, :telephone, :tel]
          }
          
          # Apply field mappings
          normalized_data = {}
          field_mappings.each do |standard_key, variations|
            # Find the first matching variation that exists in the data
            matching_key = variations.find { |var| data.key?(var) }
            normalized_data[standard_key] = data[matching_key] if matching_key
          end
          
          # Log the normalized data
          Rails.logger.info "Normalized customer data: #{normalized_data.inspect}"
          
          # Ensure we have the required fields
          unless normalized_data[:name].present? && normalized_data[:email].present?
            Rails.logger.warn "Skipping customer with missing name or email: #{normalized_data.inspect}"
            stats[:failed] += 1
            next
          end
          
          # Look for an existing customer by email
          existing = Customer.find_by(email: normalized_data[:email])
          
          if existing
            # Update existing customer
            Rails.logger.info "Found existing customer: #{existing.id} - #{existing.name}"
            if existing.update(normalized_data)
              stats[:updated] += 1
              Rails.logger.info "Updated customer: #{existing.id} - #{existing.name}"
            else
              Rails.logger.warn "Failed to update customer: #{existing.errors.full_messages.join(', ')}"
              stats[:failed] += 1
            end
          else
            # Create new customer
            Rails.logger.info "Creating new customer with data: #{normalized_data.inspect}"
            customer = Customer.new(normalized_data)
            if customer.save
              stats[:created] += 1
              Rails.logger.info "Created customer: #{customer.id} - #{customer.name}"
            else
              Rails.logger.warn "Failed to create customer: #{customer.errors.full_messages.join(', ')}"
              stats[:failed] += 1
            end
          end
        end

        # Create a detailed success message
        success_message = "Import completed successfully! "
        success_message += "#{stats[:created]} customers created, " if stats[:created] > 0
        success_message += "#{stats[:updated]} customers updated, " if stats[:updated] > 0
        success_message += "#{stats[:failed]} failed." if stats[:failed] > 0

        render_success({ 
          message: success_message,
          stats: stats 
        })
      rescue => e
        Rails.logger.error "Import error: #{e.message}\n#{e.backtrace.join("\n")}"
        render_error("Import failed: #{e.message}", :unprocessable_entity)
      end
    end

    def analyze
      return render_error("No file uploaded", :unprocessable_entity) unless params[:file]

      begin
        analyzer = AiDocumentAnalyzer.new(params[:file])
        analysis_result = analyzer.analyze
        render_success(analysis_result)
      rescue => e
        Rails.logger.error "AI Analysis error: #{e.message}\n#{e.backtrace.join("\n")}"
        
        # Fallback to mock response on error
        mock_result = {
          can_import: true,
          confidence_score: 0.85,
          warnings: [
            "Error occurred: #{e.message}",
            "Using fallback analysis"
          ],
          suggestions: [
            "Check file format",
            "Try again later"
          ],
          analysis_details: "Analysis failed, using fallback data. Error: #{e.message}"
        }
        
        render_success(mock_result)
      end
    end

    def destroy
      customer = Customer.find_by(id: params[:id])
      
      if customer
        begin
          # Use delete instead of destroy to avoid association callbacks
          if customer.delete
            render_success({ message: "Customer deleted successfully" })
          else
            render_error("Failed to delete customer", :unprocessable_entity)
          end
        rescue => e
          Rails.logger.error "Error deleting customer: #{e.message}\n#{e.backtrace.join("\n")}"
          render_error("Error deleting customer: #{e.message}", :unprocessable_entity)
        end
      else
        render_error("Customer not found", :not_found)
      end
    end

    def bulk_destroy
      if params[:ids].blank?
        return render_error("No customer IDs provided", :unprocessable_entity)
      end

      customer_ids = params[:ids].is_a?(Array) ? params[:ids] : params[:ids].split(',')
      
      stats = {
        total: customer_ids.size,
        deleted: 0,
        failed: 0
      }
      
      failed_ids = []
      
      customer_ids.each do |id|
        customer = Customer.find_by(id: id)
        
        if customer
          begin
            # Use delete instead of destroy to avoid association callbacks
            if customer.delete
              stats[:deleted] += 1
            else
              stats[:failed] += 1
              failed_ids << id
            end
          rescue => e
            Rails.logger.error "Error deleting customer #{id}: #{e.message}"
            stats[:failed] += 1
            failed_ids << id
          end
        else
          stats[:failed] += 1
          failed_ids << id
        end
      end
      
      if stats[:failed] > 0
        render_success({
          message: "Partially completed. Deleted #{stats[:deleted]} customers, failed to delete #{stats[:failed]} customers.",
          stats: stats,
          failed_ids: failed_ids
        })
      else
        render_success({
          message: "Successfully deleted #{stats[:deleted]} customers",
          stats: stats
        })
      end
    end

    def export
      customers = Customer.all
      
      # Use the existing DataExportService
      csv_data = DataExportService.to_csv(customers)
      
      # Set headers for CSV download
      response.headers['Content-Type'] = 'text/csv'
      response.headers['Content-Disposition'] = "attachment; filename=customers_export_#{Date.today}.csv"
      
      # Return the raw CSV data
      render plain: csv_data
    end

    private

    def customer_params
      params.require(:customer).permit(:name, :email, :address, :phone)
    end

    def detect_file_format(content, filename)
      # Try to detect JSON
      if content.strip.start_with?('{') || content.strip.start_with?('[')
        begin
          JSON.parse(content)
          return 'json'
        rescue JSON::ParserError
          # Not valid JSON
        end
      end
      
      # Try to detect XML
      if content.strip.start_with?('<')
        begin
          Nokogiri::XML(content) { |config| config.strict }
          return 'xml'
        rescue Nokogiri::XML::SyntaxError
          # Not valid XML
        end
      end
      
      # Default to CSV or use file extension
      ext = File.extname(filename).downcase.delete('.')
      return ext if ['csv', 'json', 'xml'].include?(ext)
      
      # Default to CSV if we can't detect
      return 'csv'
    end

    def parse_file_content(content, format)
      case format
      when 'json'
        parse_json_content(content)
      when 'xml'
        parse_xml_content(content)
      else
        parse_csv_content(content)
      end
    end

    def parse_json_content(content)
      data = JSON.parse(content)
      
      # Handle different JSON structures
      if data.is_a?(Array)
        return data
      elsif data.is_a?(Hash) && data['data'].is_a?(Array)
        return data['data']
      elsif data.is_a?(Hash) && data['customers'].is_a?(Array)
        return data['customers']
      elsif data.is_a?(Hash) && data['success'] && data['data'].is_a?(Array)
        return data['data']
      else
        Rails.logger.warn "Unexpected JSON structure: #{data.keys.join(', ')}"
        return []
      end
    end

    def parse_xml_content(content)
      doc = Nokogiri::XML(content)
      xml_data = Hash.from_xml(doc.to_s)
      
      # Handle different XML structures
      if xml_data["customers"] && xml_data["customers"]["customer"]
        customers_data = xml_data["customers"]["customer"]
        return customers_data.is_a?(Array) ? customers_data : [customers_data]
      else
        Rails.logger.warn "Unexpected XML structure: #{xml_data.keys.join(', ')}"
        return []
      end
    end

    def parse_csv_content(content)
      begin
        csv = CSV.parse(content, headers: true)
        return csv.map(&:to_h)
      rescue CSV::MalformedCSVError => e
        Rails.logger.error "CSV parsing error: #{e.message}"
        
        # Try manual parsing
        lines = content.split("\n")
        headers = lines.first.split(',').map(&:strip)
        
        rows = []
        lines[1..-1].each do |line|
          values = line.split(',').map(&:strip)
          row = {}
          headers.each_with_index do |header, i|
            row[header] = values[i] if i < values.length
          end
          rows << row
        end
        
        return rows
      end
    end
  end
end 