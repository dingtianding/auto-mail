require 'csv'
require 'json'
require 'builder'

class DataExportService
  def self.to_csv(records)
    return "" if records.empty?
    
    # Get column names from the first record
    columns = records.first.attributes.keys - ['created_at', 'updated_at']
    
    CSV.generate(headers: true) do |csv|
      # Add headers
      csv << columns
      
      # Add data rows
      records.each do |record|
        csv << columns.map { |column| record.send(column) }
      end
    end
  end

  def self.to_json(records)
    records.to_json
  end

  def self.to_xml(records)
    records.to_xml
  end
end 
end 