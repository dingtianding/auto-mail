module Api
  class PromptsController < ApplicationController
    skip_before_action :verify_authenticity_token
    
    # Get the current prompt
    def current
      prompt = Prompt.order(created_at: :desc).first
      
      if prompt
        render json: { content: prompt.content }
      else
        render json: { content: default_prompt }
      end
    end
    
    # Create a new prompt
    def create
      prompt = Prompt.new(content: params[:content])
      
      if prompt.save
        render json: { message: "Prompt saved successfully" }, status: :created
      else
        render json: { error: prompt.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end
    end
    
    private
    
    def default_prompt
      "You are a helpful assistant for FinanceFlow. Answer questions about financial data, invoices, and customer information."
    end
  end
end 