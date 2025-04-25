require 'net/http'
require 'uri'
require 'json'

class GroqService
  def self.call(prompt)
    # Always use the real API in both production and development
    begin
      # Check if API key is configured
      api_key = ENV['GROQ_API_KEY']
      if api_key.blank?
        Rails.logger.error("GROQ_API_KEY is not configured")
        return "AI service is not properly configured. Please check your environment variables."
      end
      
      Rails.logger.info("Initializing Groq API request")
      
      # Use direct HTTP request instead of the gem
      uri = URI.parse("https://api.groq.com/openai/v1/chat/completions")
      request = Net::HTTP::Post.new(uri)
      request["Authorization"] = "Bearer #{api_key}"
      request["Content-Type"] = "application/json"
      
      request.body = {
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant for an automated mailing service business. Provide concise, accurate information about mailing services, document management, and customer relationship management. If you don't know something, say so rather than making up information." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1024
      }.to_json
      
      Rails.logger.info("Sending request to Groq API with prompt length: #{prompt.length}")
      
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
        http.request(request)
      end
      
      Rails.logger.info("Received response from Groq API: #{response.code}")
      
      if response.code == "200"
        parsed_response = JSON.parse(response.body)
        
        if !parsed_response["choices"] || parsed_response["choices"].empty?
          Rails.logger.error("Groq API returned empty choices array")
          return "Sorry, I received an empty response from the AI service. Please try again."
        end
        
        content = parsed_response["choices"][0]["message"]["content"]
        
        if content.blank?
          Rails.logger.error("Groq API returned empty content")
          return "Sorry, I received an empty response from the AI service. Please try again."
        end
        
        Rails.logger.info("Successfully extracted response with length: #{content.length}")
        
        return content
      else
        error_message = "Groq API error: #{response.code} - #{response.body}"
        Rails.logger.error(error_message)
        return "Sorry, I'm having trouble connecting to my AI service right now. Please try again later. Error: #{response.code}"
      end
    rescue => e
      Rails.logger.error("Groq API error: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      return "Sorry, I'm having trouble connecting to my AI service right now. Please try again later. Error: #{e.message}"
    end
  end
  
  def self.chat(message, context = nil, model = "llama3-70b-8192")
    # Always use the real API in both production and development
    begin
      # Check if API key is set
      if ENV['GROQ_API_KEY'].blank?
        Rails.logger.error("Groq API key is not set")
        return "I'm sorry, the AI service is not properly configured. Please contact the administrator."
      end
      
      uri = URI.parse("https://api.groq.com/openai/v1/chat/completions")
      request = Net::HTTP::Post.new(uri)
      request["Authorization"] = "Bearer #{ENV['GROQ_API_KEY']}"
      request["Content-Type"] = "application/json"
      
      messages = []
      
      # Create a detailed system prompt about your application
      default_system_prompt = <<~PROMPT
        You are an AI assistant for a business automation application called QuickPilot.
        
        About QuickPilot:
        - It's a business management platform that helps users manage customers, documents, and invoices.
        - Users can track revenue, monitor invoice status, and analyze business performance.
        - The application provides dashboards with charts showing monthly revenue and invoice status.
        - It offers AI-powered business insights and recommendations.
        
        Key features:
        - Customer management: Add, edit, and track customer information
        - Document management: Create and store documents related to customers
        - Invoice management: Generate invoices, track payment status, and monitor revenue
        - Dashboard: View business metrics, charts, and AI-generated insights
        - AI insights: Get automated analysis of business performance and recommendations
        
        When helping users:
        - Be concise and professional
        - Provide specific information about how to use the application features
        - If asked about technical details you don't know, suggest contacting support
        - Focus on helping users accomplish their business tasks efficiently
        
        The application has the following main sections:
        - Dashboard: Overview of business metrics and performance
        - Customers: Manage customer information and relationships
        - Documents: Create and manage business documents
        - Invoices: Generate and track invoices and payments
        - Settings: Configure application preferences
        
        Answer questions clearly and concisely, focusing on helping users get the most value from QuickPilot.
      PROMPT
      
      # Use provided context or default to the comprehensive system prompt
      system_content = context || default_system_prompt
      messages << { role: "system", content: system_content }
      
      # Add user message
      messages << { role: "user", content: message }
      
      request.body = {
        model: model,
        messages: messages,
        temperature: 0.7
      }.to_json
      
      Rails.logger.info("Calling Groq API for chat with model: #{model}")
      
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
        http.request(request)
      end
      
      Rails.logger.info("Groq API response code: #{response.code}")
      
      if response.code == "200"
        parsed_response = JSON.parse(response.body)
        
        if !parsed_response["choices"] || parsed_response["choices"].empty?
          Rails.logger.error("Groq API returned empty choices array")
          return "I'm sorry, I couldn't generate a response at this time. Please try again later."
        end
        
        content = parsed_response["choices"][0]["message"]["content"]
        
        # Log the raw content for debugging
        Rails.logger.info("Raw content from Groq API: #{content.inspect}")
        
        if content.blank?
          Rails.logger.error("Groq API returned empty content for chat")
          return "I'm sorry, I couldn't generate a response at this time. Please try again later."
        end
        
        # Ensure proper encoding
        content = content.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
        
        Rails.logger.info("Successfully received chat response with length: #{content.length}")
        return content
      else
        error_message = "Groq API chat error: #{response.code} - #{response.body}"
        Rails.logger.error(error_message)
        return "I'm sorry, I encountered an error processing your request. Please try again later."
      end
    rescue => e
      Rails.logger.error("Groq chat service error: #{e.message}")
      Rails.logger.error(e.backtrace.join("\n"))
      return "I'm sorry, the service is currently unavailable. Please try again later."
    end
  end

  def self.generate_payment_reminder(customer)
    # Get customer's unpaid invoices
    unpaid_invoices = customer.invoices.unpaid
    Rails.logger.info("Generating payment reminder for customer: #{customer.id}")
    Rails.logger.info("Unpaid invoices count: #{unpaid_invoices.count}")

    # Return early if no unpaid invoices
    if unpaid_invoices.empty?
      raise "No unpaid invoices found for this customer"
    end

    # Build context for the AI
    context = {
      customer_name: customer.name,
      customer_address: customer.address,
      total_amount_due: unpaid_invoices.sum(:total_amount),
      oldest_invoice_date: unpaid_invoices.minimum(:issue_date)&.strftime('%B %d, %Y'),
      latest_invoice_date: unpaid_invoices.maximum(:issue_date)&.strftime('%B %d, %Y'),
      invoice_count: unpaid_invoices.count,
      company_name: ENV['COMPANY_NAME'] || "Your Company Name",
      company_contact: ENV['COMPANY_EMAIL'] || "contact@example.com"
    }
    
    Rails.logger.info("Context for AI: #{context.inspect}")

    # Prompt template for the payment reminder
    prompt = <<~PROMPT
      Generate a professional payment reminder letter with the following details:
      
      Customer: #{context[:customer_name]}
      Address: #{context[:customer_address]}
      Total Amount Due: $#{context[:total_amount_due]}
      Number of Unpaid Invoices: #{context[:invoice_count]}
      Oldest Invoice Date: #{context[:oldest_invoice_date]}
      Latest Invoice Date: #{context[:latest_invoice_date]}
      
      The letter should:
      1. Be professional and courteous
      2. Clearly state the total amount due
      3. Mention the date range of unpaid invoices
      4. Request prompt payment
      5. Include contact information for questions
      6. Thank the customer for their business
      
      Use formal business letter format.
    PROMPT

    # Use the existing call method to generate the letter
    response = call(prompt)
    
    if response.include?("Sorry") || response.include?("error")
      raise "Failed to generate letter: #{response}"
    end
    
    response
  end
end 