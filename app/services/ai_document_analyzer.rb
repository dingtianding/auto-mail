class AiDocumentAnalyzer
  require 'csv'
  require 'json'
  require 'nokogiri'

  def initialize(file)
    @file = file
  end

  def analyze
    begin
      # Extract the actual content from the file
      content = read_file_content
      
      # Log the content for debugging
      Rails.logger.info "File content extracted: #{content.truncate(100)}" if content.respond_to?(:truncate)
      
      # Create a prompt with the actual file content
      prompt = create_analysis_prompt(content)
      
      # Send to Groq for analysis
      analysis = GroqService.chat(prompt)
      
      # Parse the analysis response
      {
        can_import: !has_critical_issues?(analysis),
        confidence_score: calculate_confidence(analysis),
        warnings: extract_warnings(analysis),
        suggestions: extract_suggestions(analysis),
        analysis_details: analysis
      }
    rescue => e
      Rails.logger.error "Error in AI analysis: #{e.message}\n#{e.backtrace.join("\n")}"
      {
        can_import: false,
        confidence_score: 0.0,
        warnings: ["Error analyzing file: #{e.message}"],
        suggestions: ["Please check file format and try again"],
        analysis_details: "Analysis failed due to an error: #{e.message}"
      }
    end
  end

  private

  def read_file_content
    case File.extname(@file.original_filename).downcase
    when '.csv'
      parse_csv_safely
    when '.json'
      parse_json_safely
    when '.xml'
      parse_xml_safely
    else
      raise "Unsupported file format: #{File.extname(@file.original_filename)}"
    end
  end

  def parse_csv_safely
    begin
      # Read the file content directly
      content = File.read(@file.path)
      
      # For debugging, log the first few lines
      Rails.logger.info "CSV first 100 chars: #{content[0..100]}"
      
      # Return the raw content for analysis
      content
    rescue => e
      Rails.logger.error "Error reading CSV: #{e.message}"
      raise "Could not read CSV file: #{e.message}"
    end
  end

  def parse_json_safely
    begin
      File.read(@file.path)
    rescue => e
      raise "Could not read JSON file: #{e.message}"
    end
  end

  def parse_xml_safely
    begin
      File.read(@file.path)
    rescue => e
      raise "Could not read XML file: #{e.message}"
    end
  end

  def create_analysis_prompt(content)
    "You are a data quality analyzer for customer data. Analyze the following data and provide feedback:
    1. Identify any formatting issues
    2. Check for missing required fields (name, email, address, phone)
    3. Validate email formats
    4. Check for duplicate entries
    5. Identify any other data quality issues
    
    Important guidelines:
    - The basic format of name, email, address, and phone is considered acceptable
    - Focus on actual data problems, not stylistic preferences
    - Only flag issues that would cause import problems
    - Consider standard formats for emails (user@domain.com) and phone numbers (with or without dashes) as valid
    
    Respond with:
    - Overall assessment (can this data be imported safely?)
    - Confidence score (0-100%)
    - List of warnings (start each with 'WARNING:')
    - List of suggestions (start each with 'SUGGESTION:')
    - Detailed analysis
    
    Here's the data to analyze:
    
    #{content}"
  end

  def has_critical_issues?(analysis)
    analysis.downcase.include?("cannot be imported") || 
    analysis.downcase.include?("critical error") ||
    analysis.downcase.include?("unsafe to import")
  end

  def calculate_confidence(analysis)
    # Extract confidence percentage from the analysis
    # Try different patterns to find the confidence score
    patterns = [
      /confidence score:?\s*(\d+)%/i,
      /confidence score:?\s*(\d+)/i,
      /confidence:?\s*(\d+)%/i,
      /confidence:?\s*(\d+)/i,
      /\*\*confidence score:\*\*\s*(\d+)%/i,  # Markdown format
      /confidence score.*?(\d+)%/i,  # More flexible pattern
    ]
    
    # Log the analysis text for debugging
    Rails.logger.info "Analyzing for confidence score: #{analysis[0..200]}..."
    
    patterns.each do |pattern|
      match = analysis.match(pattern)
      if match && match[1]
        score = match[1].to_f / 100.0
        Rails.logger.info "Found confidence score: #{score} using pattern: #{pattern.inspect}"
        return score
      end
    end
    
    # If we still can't find it, try a more aggressive approach
    # Look for any number followed by % in the first few lines
    first_few_lines = analysis.split("\n")[0..10].join("\n")
    percentage_match = first_few_lines.match(/(\d+)%/)
    if percentage_match && percentage_match[1]
      score = percentage_match[1].to_f / 100.0
      Rails.logger.info "Found confidence score using percentage match: #{score}"
      return score
    end
    
    # Default confidence if not found
    Rails.logger.warn "Could not find confidence score in analysis, using default 0.7"
    0.7
  end

  def extract_warnings(analysis)
    # Look for WARNING: pattern
    warnings = analysis.scan(/WARNING:\s*(.+?)(?=\n|$)/).flatten.map(&:strip)
    
    # If no warnings found with WARNING: prefix, try to find bullet points with warnings
    if warnings.empty?
      warning_section = analysis.match(/warnings?:(.*?)(?=suggestions?:|$)/im)
      if warning_section
        warnings = warning_section[1].strip.split(/\n\s*\*\s*/).reject(&:empty?)
        warnings.shift if warnings.first&.strip&.empty? # Remove empty first item if present
      end
    end
    
    warnings
  end

  def extract_suggestions(analysis)
    # Look for SUGGESTION: pattern
    suggestions = analysis.scan(/SUGGESTION:\s*(.+?)(?=\n|$)/).flatten.map(&:strip)
    
    # If no suggestions found with SUGGESTION: prefix, try to find bullet points with suggestions
    if suggestions.empty?
      suggestion_section = analysis.match(/suggestions?:(.*?)(?=detailed analysis:|$)/im)
      if suggestion_section
        suggestions = suggestion_section[1].strip.split(/\n\s*\*\s*/).reject(&:empty?)
        suggestions.shift if suggestions.first&.strip&.empty? # Remove empty first item if present
      end
    end
    
    suggestions
  end
end 