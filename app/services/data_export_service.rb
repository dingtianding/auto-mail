require 'csv'
require 'json'
require 'builder'

class DataExportService
  def initialize(user_id)
    @user_id = user_id
  end

  def export_data
    # Your export logic here
    {
      user_data: get_user_data,
      invoices: get_invoices,
      documents: get_documents
    }
  end

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

  private

  def get_user_data
    # Logic to fetch user data
    user = User.find_by(id: @user_id)
    return {} unless user
    
    {
      id: user.id,
      email: user.email,
      name: user.name
    }
  end

  def get_invoices
    # Logic to fetch invoices
    Invoice.where(user_id: @user_id).map do |invoice|
      {
        id: invoice.id,
        amount: invoice.amount,
        status: invoice.status
      }
    end
  end

  def get_documents
    # Logic to fetch documents
    Document.where(user_id: @user_id).map do |doc|
      {
        id: doc.id,
        name: doc.name,
        file_type: doc.file_type
      }
    end
  end
end 