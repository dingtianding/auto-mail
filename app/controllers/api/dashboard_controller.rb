module Api
  class DashboardController < Api::BaseController
    def stats
      begin
        stats = {
          total_customers: Customer.count,
          total_documents: MailingDocument.count,
          total_invoices: Invoice.count,
          total_revenue: Invoice.sum(:total_amount),
          database_size: calculate_db_size,
          system_status: {
            postgresql: check_postgresql,
            mongodb: check_mongodb,
            rails: 'Active',
            redis: check_redis,
            sidekiq: 'Inactive'  # Set to inactive since Sidekiq isn't configured
          },
          performance: {
            avg_processing_time: '0ms',  # Placeholder
            queue_size: 0,  # Default when Sidekiq isn't available
            memory_usage: get_memory_usage
          },
          environment: {
            rails_env: Rails.env,
            rails_version: Rails.version,
            ruby_version: RUBY_VERSION,
            node_env: ENV['NODE_ENV'] || 'development'
          }
        }

        render json: { success: true, data: stats }
      rescue => e
        Rails.logger.error("Error fetching dashboard stats: #{e.message}")
        render json: { success: false, error: "Error fetching stats" }, status: :internal_server_error
      end
    end

    def index
      begin
        # Calculate key metrics
        total_customers = Customer.count
        total_documents = MailingDocument.count
        total_invoices = Invoice.count
        total_revenue = Invoice.where(status: 'paid').sum(:total_amount) || 0
        
        # Get recent customers
        recent_customers = Customer.order(created_at: :desc).limit(5)
        
        # Get recent invoices
        recent_invoices = Invoice.order(created_at: :desc).limit(5)
        
        # Generate monthly revenue data for chart
        monthly_revenue = generate_monthly_revenue_data
        
        # Generate invoice status data for chart
        invoice_status = generate_invoice_status_data
        
        # Generate AI insights if enabled
        ai_insights = if defined?(GroqService) && ENV['GROQ_API_KEY'].present?
          begin
            generate_ai_insights(
              total_customers,
              total_documents,
              total_invoices,
              total_revenue,
              monthly_revenue,
              invoice_status
            )
          rescue => e
            Rails.logger.error("Error generating AI insights: #{e.message}")
            nil
          end
        end
        
        # Generate business summary with stats-based insights if AI insights are not available
        business_summary = if ai_insights.present?
          {
            summary: ai_insights["detailedAnalysis"],
            trends: ai_insights["keyFindings"].map { |finding| { title: "Key Finding", description: finding } },
            todos: ai_insights["recommendations"].map.with_index do |recommendation, index|
              priority = case index
                        when 0 then "high"
                        when 1 then "medium"
                        else "low"
                        end
                        
              # Determine if this recommendation is related to customers
              is_customer_related = recommendation.downcase.include?("customer")
              is_invoice_related = recommendation.downcase.include?("invoice")
              is_document_related = recommendation.downcase.include?("document")
              
              action = if is_customer_related
                        { text: "View Customers", link: "/customers" }
                      elsif is_invoice_related
                        { text: "View Invoices", link: "/invoices" }
                      elsif is_document_related
                        { text: "View Documents", link: "/documents" }
                      else
                        nil
                      end
              
              {
                title: recommendation.split(".").first,
                description: recommendation,
                priority: priority,
                action: action
              }
            end,
            # Add the detailed analysis for expandable view
            detailedAnalysis: {
              fullText: ai_insights["rawOutput"] || ai_insights.to_json,
              sections: ai_insights["detailedAnalysis"].split("\n\n").map { |paragraph| paragraph.strip }
            }
          }
        else
          stats_summary = generate_stats_based_summary(
            total_customers,
            total_documents,
            total_invoices,
            total_revenue,
            monthly_revenue,
            invoice_status
          )
          
          # Add detailed analysis for stats-based summary too
          stats_summary[:detailedAnalysis] = {
            fullText: stats_summary[:summary],
            sections: [stats_summary[:summary]]
          }
          
          stats_summary
        end
        
        render json: {
          success: true,
          data: {
            totalCustomers: total_customers,
            totalDocuments: total_documents,
            totalInvoices: total_invoices,
            totalRevenue: total_revenue,
            recentCustomers: recent_customers,
            recentInvoices: recent_invoices,
            monthlyRevenue: monthly_revenue,
            invoiceStatus: invoice_status,
            businessSummary: business_summary
          }
        }
      rescue => e
        Rails.logger.error("Dashboard index error: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { success: false, error: "Error loading dashboard data: #{e.message}" }, status: :internal_server_error
      end
    end

    private

    def calculate_db_size
      # Add your database size calculation logic here
      "#{ActiveRecord::Base.connection.execute('SELECT pg_database_size(current_database());').first['pg_database_size'].to_i / 1024} kB"
    end

    def check_postgresql
      ActiveRecord::Base.connection.active? ? 'Active' : 'Inactive'
    rescue
      'Inactive'
    end

    def check_mongodb
      Mongoid.default_client.command(ping: 1)
      'Active'
    rescue
      'Inactive'
    end

    def check_redis
      return 'Inactive' unless defined?(Redis)
      begin
        Redis.new.ping == 'PONG' ? 'Active' : 'Inactive'
      rescue
        'Inactive'
      end
    end

    def get_memory_usage
      # Basic memory usage calculation
      memory = `ps -o rss= -p #{Process.pid}`.to_i / 1024
      "#{memory} MB"
    rescue
      "N/A"
    end

    def generate_monthly_revenue_data
      # Get the last 6 months
      end_date = Date.today
      start_date = end_date - 5.months
      
      # Initialize the result array with all months
      result = []
      
      # Create a hash to store month names
      month_names = {
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Aug', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
      }
      
      # Generate data for each month
      (start_date.to_date..end_date.to_date).select { |d| d.day == 1 }.each do |month_start|
        month_end = month_start.end_of_month
        
        # Get paid revenue for the month
        paid_revenue = Invoice.where(status: 'paid')
                             .where('created_at >= ? AND created_at <= ?', month_start, month_end)
                             .sum(:total_amount) || 0
        
        # Get pending revenue for the month
        pending_revenue = Invoice.where(status: 'pending')
                                .where('created_at >= ? AND created_at <= ?', month_start, month_end)
                                .sum(:total_amount) || 0
        
        # Format the month name
        month_name = "#{month_names[month_start.month]} #{month_start.year}"
        
        # Add to result
        result << {
          month: month_name,
          amount: paid_revenue,
          paid: paid_revenue,
          pending: pending_revenue,
          total: paid_revenue + pending_revenue
        }
      end
      
      # If we have fewer than 6 months of data, pad with earlier months
      if result.length < 6
        months_to_add = 6 - result.length
        last_month = start_date - 1.month
        
        months_to_add.times do |i|
          month_start = last_month - i.months
          month_name = "#{month_names[month_start.month]} #{month_start.year}"
          
          # Get paid revenue for the month
          paid_revenue = Invoice.where(status: 'paid')
                               .where('created_at >= ? AND created_at <= ?', month_start.beginning_of_month, month_start.end_of_month)
                               .sum(:total_amount) || 0
          
          # Get pending revenue for the month
          pending_revenue = Invoice.where(status: 'pending')
                                  .where('created_at >= ? AND created_at <= ?', month_start.beginning_of_month, month_start.end_of_month)
                                  .sum(:total_amount) || 0
          
          # Add to the beginning of the result
          result.unshift({
            month: month_name,
            amount: paid_revenue,
            paid: paid_revenue,
            pending: pending_revenue,
            total: paid_revenue + pending_revenue
          })
        end
      end
      
      result
    end

    def generate_invoice_status_data
      # Count invoices by status
      statuses = Invoice.group(:status).count
      
      # Format for pie chart
      statuses.map do |status, count|
        {
          name: status.capitalize,
          value: count
        }
      end
    end

    def generate_stats_based_summary(total_customers, total_documents, total_invoices, total_revenue, monthly_revenue, invoice_status)
      # Calculate key metrics
      avg_revenue_per_customer = total_customers > 0 ? (total_revenue / total_customers).round(2) : 0
      avg_documents_per_customer = total_customers > 0 ? (total_documents.to_f / total_customers).round(1) : 0
      avg_invoices_per_customer = total_customers > 0 ? (total_invoices.to_f / total_customers).round(1) : 0
      
      # Determine revenue trend
      revenue_trend = determine_revenue_trend(monthly_revenue)
      
      # Get pending invoices count
      pending_invoices = invoice_status.find { |status| status[:name].downcase == 'pending' }
      pending_count = pending_invoices ? pending_invoices[:value] : 0
      
      # Generate summary text
      summary = "Your business currently has #{total_customers} customers, #{total_documents} documents, and #{total_invoices} invoices with a total revenue of $#{total_revenue.round(2)}. "
      summary += "On average, each customer has #{avg_documents_per_customer} documents and #{avg_invoices_per_customer} invoices, generating $#{avg_revenue_per_customer} in revenue. "
      summary += "Your monthly revenue is #{revenue_trend}. "
      summary += "You have #{pending_count} pending invoices that require attention."
      
      # Generate trends
      trends = [
        {
          title: "Customer Engagement",
          description: "Average of #{avg_documents_per_customer} documents and #{avg_invoices_per_customer} invoices per customer"
        },
        {
          title: "Revenue Performance",
          description: "Average revenue of $#{avg_revenue_per_customer} per customer"
        },
        {
          title: "Monthly Revenue",
          description: revenue_trend
        }
      ]
      
      # Generate action items
      todos = []
      
      if pending_count > 0
        todos << {
          title: "Follow up on pending invoices",
          description: "You have #{pending_count} pending invoices that need attention",
          priority: "high",
          action: {
            text: "View Invoices",
            link: "/invoices?status=pending"
          }
        }
      end
      
      if avg_documents_per_customer < 1
        todos << {
          title: "Increase document creation",
          description: "Your customers have fewer than 1 document on average",
          priority: "medium",
          action: {
            text: "Create Document",
            link: "/documents/new"
          }
        }
      end
      
      if avg_invoices_per_customer < 1
        todos << {
          title: "Generate more invoices",
          description: "Your customers have fewer than 1 invoice on average",
          priority: "medium",
          action: {
            text: "Create Invoice",
            link: "/invoices/new"
          }
        }
      end
      
      if total_customers < 10
        todos << {
          title: "Acquire more customers",
          description: "Grow your customer base to increase revenue potential",
          priority: "medium",
          action: {
            text: "Add Customer",
            link: "/customers/new"
          }
        }
      end
      
      # Return the business summary
      {
        summary: summary,
        trends: trends,
        todos: todos
      }
    end
    
    def determine_revenue_trend(monthly_revenue)
      return "stable with no data" if monthly_revenue.empty?
      
      # Get the last two months with data
      months_with_revenue = monthly_revenue.select { |m| m[:amount] > 0 }
      
      if months_with_revenue.empty?
        return "showing no activity"
      elsif months_with_revenue.length == 1
        return "showing activity only in #{months_with_revenue[0][:month]}"
      end
      
      # Sort by date (assuming the month strings can be compared)
      sorted_months = months_with_revenue.sort_by { |m| m[:month] }
      last_month = sorted_months[-1]
      previous_month = sorted_months[-2]
      
      if last_month[:amount] > previous_month[:amount]
        percentage = ((last_month[:amount] - previous_month[:amount]) / previous_month[:amount] * 100).round(1)
        "increasing by #{percentage}% from #{previous_month[:month]} to #{last_month[:month]}"
      elsif last_month[:amount] < previous_month[:amount]
        percentage = ((previous_month[:amount] - last_month[:amount]) / previous_month[:amount] * 100).round(1)
        "decreasing by #{percentage}% from #{previous_month[:month]} to #{last_month[:month]}"
      else
        "stable between #{previous_month[:month]} and #{last_month[:month]}"
      end
    end

    def generate_ai_insights(total_customers, total_documents, total_invoices, total_revenue, monthly_revenue, invoice_status)
      # Prepare business data for analysis
      business_data = {
        total_customers: total_customers,
        total_documents: total_documents,
        total_invoices: total_invoices,
        total_revenue: total_revenue,
        avg_revenue_per_customer: total_customers > 0 ? (total_revenue.to_f / total_customers).round(2) : 0,
        avg_documents_per_customer: total_customers > 0 ? (total_documents.to_f / total_customers).round(1) : 0,
        avg_invoices_per_customer: total_customers > 0 ? (total_invoices.to_f / total_customers).round(1) : 0,
        monthly_revenue: monthly_revenue,
        invoice_status: invoice_status
      }

      # Create the prompt with instructions for the desired response format
      prompt = <<~PROMPT
        You are a business analytics expert. Analyze the following business data and provide insights:

        BUSINESS DATA:
        #{business_data.to_json}

        Based on this data, please provide:
        1. A detailed analysis (3-4 paragraphs) of the business performance
        2. 3-5 key findings as bullet points
        3. 3-5 specific recommendations as bullet points

        Format your response as a JSON object with the following structure:
        {
          "detailedAnalysis": "Your detailed analysis here...",
          "keyFindings": ["Finding 1", "Finding 2", ...],
          "recommendations": ["Recommendation 1", "Recommendation 2", ...]
        }

        IMPORTANT: Make sure your response is valid JSON. Do not include any text outside the JSON object.
      PROMPT

      # Call the Groq API
      response = GroqService.call(prompt)
      
      # Store the raw response for display
      raw_response = response
      
      # Parse the JSON response
      begin
        # Try to find valid JSON in the response by looking for matching braces
        json_match = response.match(/\{.*\}/m)
        if json_match
          json_string = json_match[0]
          insights = JSON.parse(json_string)
          # Add the raw response to the insights
          insights["rawOutput"] = raw_response
          return insights
        else
          raise JSON::ParserError, "No JSON object found in response"
        end
      rescue JSON::ParserError => e
        Rails.logger.error("Error parsing Groq response: #{e.message}")
        Rails.logger.error("Raw response: #{raw_response}")
        # Return fallback insights if parsing fails
        return {
          "detailedAnalysis" => "The business is currently experiencing a stagnant period with minimal revenue. There appears to be customer engagement but limited conversion to sales. Further analysis and action is recommended to improve revenue generation.",
          "keyFindings" => [
            "Customer acquisition exists but revenue conversion is low",
            "There are pending invoices that need follow-up",
            "Document creation is not translating to completed sales"
          ],
          "recommendations" => [
            "Follow up on all pending invoices immediately to convert them to paid status",
            "Review your sales process to identify conversion bottlenecks",
            "Implement a customer outreach program to engage existing customers"
          ],
          "rawOutput" => raw_response || "Error: Unable to generate AI insights"
        }
      end
    end
  end
end 