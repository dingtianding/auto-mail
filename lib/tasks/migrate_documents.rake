namespace :documents do
  desc "Migrate existing documents to reference customers"
  task migrate_customer_references: :environment do
    puts "Starting document migration..."
    
    # Get all documents without customer_id
    documents = MailingDocument.where(customer_id: nil)
    total = documents.count
    
    puts "Found #{total} documents to migrate"
    
    documents.each_with_index do |doc, index|
      begin
        # Try to find customer by matching data in the document
        # This depends on how your documents are structured
        # You might need to adjust this logic based on your data
        
        # Example: If document content contains customer info
        content = doc.content.to_s.downcase
        
        # Try to find matching customer
        Customer.find_each do |customer|
          if content.include?(customer.name.downcase) || 
             content.include?(customer.email.downcase)
            doc.update(customer_id: customer.id)
            print "."
            break
          end
        end
        
        # If no customer found, mark for manual review
        if doc.customer_id.nil?
          puts "\nWarning: No customer found for document #{doc.id}"
          puts "Content preview: #{doc.content[0..100]}..."
        end
        
      rescue => e
        puts "\nError migrating document #{doc.id}: #{e.message}"
      end
      
      if (index + 1) % 50 == 0
        puts "\nProcessed #{index + 1} of #{total} documents"
      end
    end
    
    puts "\nMigration completed!"
    puts "Documents without customer reference: #{MailingDocument.where(customer_id: nil).count}"
  end
end 