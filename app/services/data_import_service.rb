require 'csv'
require 'json'
require 'nokogiri'

class DataImportService
  def self.import_csv(file)
    results = { imported: 0, failed: 0, errors: [] }
    
    CSV.foreach(file.path, headers: true) do |row|
      customer = Customer.new(
        name: row['name'],
        email: row['email'],
        address: row['address'],
        phone: row['phone']
      )
      
      if customer.save
        results[:imported] += 1
      else
        results[:failed] += 1
        results[:errors] << "Row for #{row['email']}: #{customer.errors.full_messages.join(', ')}"
      end
    end
    
    results
  end

  def self.import_json(file)
    data = JSON.parse(file.read)
    results = { imported: 0, failed: 0, errors: [] }
    
    data.each do |customer_data|
      customer = Customer.new(
        name: customer_data['name'],
        email: customer_data['email'],
        address: customer_data['address'],
        phone: customer_data['phone']
      )
      
      if customer.save
        results[:imported] += 1
      else
        results[:failed] += 1
        results[:errors] << "#{customer_data['email']}: #{customer.errors.full_messages.join(', ')}"
      end
    end
    
    results
  end

  def self.import_xml(file)
    doc = Nokogiri::XML(file.read)
    results = { imported: 0, failed: 0, errors: [] }
    
    doc.xpath('//customer').each do |customer_node|
      customer = Customer.new(
        name: customer_node.at_xpath('name')&.text,
        email: customer_node.at_xpath('email')&.text,
        address: customer_node.at_xpath('address')&.text,
        phone: customer_node.at_xpath('phone')&.text
      )
      
      if customer.save
        results[:imported] += 1
      else
        results[:failed] += 1
        results[:errors] << "#{customer_node.at_xpath('email')&.text}: #{customer.errors.full_messages.join(', ')}"
      end
    end
    
    results
  end
end 