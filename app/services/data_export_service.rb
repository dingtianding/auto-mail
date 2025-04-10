require 'csv'
require 'json'
require 'builder'

class DataExportService
  def self.to_csv(customers)
    CSV.generate(headers: true) do |csv|
      csv << ['name', 'email', 'address', 'phone']
      
      customers.each do |customer|
        csv << [
          customer.name,
          customer.email,
          customer.address,
          customer.phone
        ]
      end
    end
  end

  def self.to_json(customers)
    customers.map do |customer|
      {
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone
      }
    end.to_json
  end

  def self.to_xml(customers)
    xml = Builder::XmlMarkup.new(indent: 2)
    xml.customers do
      customers.each do |customer|
        xml.customer do
          xml.name customer.name
          xml.email customer.email
          xml.address customer.address
          xml.phone customer.phone
        end
      end
    end
  end
end 