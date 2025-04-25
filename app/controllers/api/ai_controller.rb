module Api
  class AiController < Api::BaseController
    # This prompt could be moved to a database setting in the future for easier customization
    INVOICE_ANALYSIS_PROMPT = <<~PROMPT
      You are an expert document analyzer specializing in invoice extraction.
      
      DOCUMENT CONTENT OR FILENAME:
      {document_content}
      
      TASK:
      {prompt_text}
      
      Extract the following information from the document:
      1. Line items (service name, description, quantity, rate)
      2. Due date
      3. Payment terms
      4. Tax rate (if available)
      5. Notes or additional information
      
      For the notes field, please create a professional, concise summary of the services being provided.
      
      Format your response as a valid JSON object with the following structure:
      {
        "line_items": [
          {
            "service": "Service name",
            "description": "Description",
            "quantity": 1,
            "rate": 100
          }
        ],
        "due_date": "YYYY-MM-DD",
        "payment_terms": "Net 30",
        "tax_rate": 0.08,
        "notes": "Professional summary note for the invoice"
      }
      
      If you cannot extract the information with confidence, respond with:
      {
        "error": "Unable to extract information from this document",
        "reason": "Explain why the extraction failed"
      }
      
      IMPORTANT: Make sure your response is valid JSON. Do not include any text outside the JSON object.
    PROMPT

    def analyze
      begin
        document = params[:document]
        prompt_text = params[:prompt] || "Analyze this document and extract invoice information."
        
        # Read the document content
        document_content = ""
        filename = document.respond_to?(:original_filename) ? document.original_filename : "unknown"
        
        if document.respond_to?(:read)
          begin
            # For binary files like PDFs, we need to extract text differently
            if document.content_type.include?('pdf')
              # Log the PDF processing attempt
              Rails.logger.info("Processing PDF file: #{filename}")
              
              # You could add PDF parsing here with a gem like 'pdf-reader'
              # For now, we'll just use the filename
              document_content = "PDF document: #{filename}"
            elsif document.content_type.include?('openxmlformats') || document.content_type.include?('msword')
              # Log the Word document processing attempt
              Rails.logger.info("Processing Word document: #{filename}")
              
              # For Word documents, we'll just use the filename
              document_content = "Word document: #{filename}"
            else
              # For text files, read and sanitize the content
              Rails.logger.info("Processing text file: #{filename}")
              raw_content = document.read
              # Ensure content is valid UTF-8
              document_content = raw_content.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
            end
          rescue => e
            Rails.logger.error("Error reading document content: #{e.message}")
            document_content = "Error reading document. Filename: #{filename}"
          end
        elsif document.is_a?(String)
          document_content = document.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
        else
          raise "Invalid document format"
        end
        
        # Log the document content length
        Rails.logger.info("Document content length: #{document_content.length} characters")
        
        # Replace placeholders in the template
        prompt = INVOICE_ANALYSIS_PROMPT
          .gsub('{document_content}', document_content)
          .gsub('{prompt_text}', prompt_text)
        
        # Log the prompt
        Rails.logger.info("Sending prompt to Groq API with length: #{prompt.length} characters")
        
        # Call the Groq API
        raw_response = GroqService.call(prompt)
        
        # Log the raw response
        Rails.logger.info("Raw response from Groq API: #{raw_response}")
        
        # Parse the JSON response
        begin
          # Try to find valid JSON in the response by looking for matching braces
          json_match = raw_response.match(/\{.*\}/m)
          if json_match
            json_string = json_match[0]
            Rails.logger.info("Extracted JSON: #{json_string}")
            
            result = JSON.parse(json_string)
            
            # Check if the AI returned an error
            if result["error"]
              Rails.logger.info("AI returned an error: #{result['error']}")
              render json: { error: result["error"], reason: result["reason"] }, status: :ok
            else
              # Return the extracted data
              Rails.logger.info("Successfully extracted invoice data")
              render json: result
            end
          else
            raise JSON::ParserError, "No JSON object found in response"
          end
        rescue JSON::ParserError => e
          Rails.logger.error("Error parsing Groq response: #{e.message}")
          
          # Try to create a simple JSON structure from the raw response
          # This is a fallback for when the AI doesn't return valid JSON
          begin
            # Create a simple structure with the raw response as notes
            simple_json = {
              "line_items": [
                {
                  "service": "Service from document",
                  "description": "See notes for details",
                  "quantity": 1,
                  "rate": 100
                }
              ],
              "due_date": (Date.today + 30).to_s,
              "payment_terms": "Net 30",
              "tax_rate": 0.08,
              "notes": "The AI couldn't properly analyze this document. Here's what it returned: " + 
                      raw_response.gsub(/[^a-zA-Z0-9\s\.\,\:\;\-\(\)]/i, ' ').squeeze(' ')[0..500]
            }
            
            Rails.logger.info("Created simple JSON structure as fallback")
            render json: simple_json
          rescue => e2
            Rails.logger.error("Error creating simple JSON: #{e2.message}")
            render json: { 
              error: "Failed to parse AI response", 
              reason: "The AI generated an invalid response format"
            }, status: :ok
          end
        end
      rescue => e
        Rails.logger.error("Error analyzing document: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        
        # Return a clear error message
        render json: { 
          error: "Failed to analyze document", 
          reason: e.message
        }, status: :ok
      end
    end
  end
end 