module Api
  class ChatController < Api::BaseController
    def create
      begin
        # Get the message from the request
        message = params[:message] || params.dig(:chat, :message)
        
        # Validate the message
        if message.blank?
          return render json: { success: false, error: "Message cannot be empty" }, status: :bad_request
        end
        
        # Log the incoming message
        Rails.logger.info("Chat request received: #{message.truncate(100)}")
        
        # Call the Groq service to get a response
        Rails.logger.info("Calling GroqService.chat")
        response = GroqService.chat(message)
        
        # Log the response for debugging
        if response.blank?
          Rails.logger.error("GroqService.chat returned empty response")
          response = "I apologize, but I'm having trouble generating a response right now. Please try again later."
        else
          Rails.logger.info("GroqService.chat response received with length: #{response.length}")
          Rails.logger.info("Response first 100 chars: #{response[0..100]}")
          
          # Check for any invisible characters or encoding issues
          encoded_response = response.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
          if encoded_response != response
            Rails.logger.warn("Response had encoding issues that were fixed")
            response = encoded_response
          end
          
          # Check if response is just whitespace
          if response.strip.empty?
            Rails.logger.error("Response contains only whitespace")
            response = "I apologize, but I received an empty response. Please try again later."
          end
        end
        
        # Return the response with debug info in development
        response_data = { 
          success: true, 
          response: response,
        }
        
        if Rails.env.development?
          response_data[:debug] = {
            response_length: response.length,
            response_preview: response[0..100],
            response_bytes: response.bytes.take(20)
          }
        end
        
        render json: response_data
      rescue => e
        Rails.logger.error("Chat error: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { 
          success: false, 
          error: "Error processing chat: #{e.message}",
          response: "I apologize, but I encountered an error while processing your request. Please try again later."
        }, status: :internal_server_error
      end
    end

    private

    def generate_context(context_params = {})
      # Start with the base system prompt
      context = <<~CONTEXT
        You are an AI assistant for FinanceFlow, a business management application.
      CONTEXT
      
      # Add user-specific information if current_user is available
      # Check if current_user method exists and returns a user
      if defined?(current_user) && current_user.present?
        context += <<~USER_CONTEXT
          You are currently helping #{current_user.name || current_user.email}.
          They have been using the application since #{current_user.created_at.strftime('%B %Y')}.
        USER_CONTEXT
        
        # Add business statistics
        customer_count = Customer.count
        invoice_count = Invoice.count
        total_revenue = Invoice.where(status: 'paid').sum(:total_amount) || 0
        
        context += <<~STATS_CONTEXT
          Their business currently has:
          - #{customer_count} customers
          - #{invoice_count} invoices
          - $#{total_revenue.round(2)} in total revenue
        STATS_CONTEXT
      else
        # Add generic context for non-authenticated users
        context += <<~GENERIC_CONTEXT
          You are providing general information about the FinanceFlow application.
        GENERIC_CONTEXT
      end
      
      # Add context-specific information
      if context_params.present?
        if context_params[:customer_id].present?
          customer = Customer.find_by(id: context_params[:customer_id])
          if customer
            context += <<~CUSTOMER_CONTEXT
              
              You are currently discussing customer: #{customer.name}
              Email: #{customer.email}
              Created: #{customer.created_at.strftime('%B %d, %Y')}
              Documents: #{customer.mailing_documents.count}
              Invoices: #{customer.invoices.count}
              Total Revenue: $#{customer.invoices.where(status: 'paid').sum(:total_amount).round(2)}
            CUSTOMER_CONTEXT
          end
        end
        
        if context_params[:invoice_id].present?
          invoice = Invoice.find_by(id: context_params[:invoice_id])
          if invoice
            context += <<~INVOICE_CONTEXT
              
              You are currently discussing invoice ##{invoice.invoice_number || invoice.id}
              Customer: #{invoice.customer&.name || 'Unknown'}
              Amount: $#{invoice.total_amount.round(2)}
              Status: #{invoice.status}
              Created: #{invoice.created_at.strftime('%B %d, %Y')}
              Due Date: #{invoice.due_date&.strftime('%B %d, %Y') || 'Not set'}
            INVOICE_CONTEXT
          end
        end
        
        if context_params[:document_id].present?
          document = MailingDocument.find_by(id: context_params[:document_id])
          if document
            context += <<~DOCUMENT_CONTEXT
              
              You are currently discussing document: #{document.title || document.id}
              Customer: #{document.customer&.name || 'Unknown'}
              Created: #{document.created_at.strftime('%B %d, %Y')}
              Type: #{document.document_type || 'Standard'}
            DOCUMENT_CONTEXT
          end
        end
        
        if context_params[:page].present?
          context += <<~PAGE_CONTEXT
            
            The user is currently on the #{context_params[:page]} page of the application.
          PAGE_CONTEXT
        end
      end
      
      # Add instructions for how to respond
      context += <<~INSTRUCTIONS
        
        When responding:
        1. Be concise and professional
        2. Provide specific information about how to use relevant features
        3. If you don't know something, say so clearly
        4. Focus on helping the user accomplish their business tasks efficiently
        
        The application has these main sections:
        - Dashboard: Overview of business metrics and performance
        - Customers: Manage customer information and relationships
        - Documents: Create and manage business documents
        - Invoices: Generate and track invoices and payments
        - Settings: Configure application preferences
      INSTRUCTIONS
      
      context
    end
  end
end 