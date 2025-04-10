class CreateInvoices < ActiveRecord::Migration[7.0]
  def change
    create_table :invoices do |t|
      t.string :invoice_number
      t.references :customer, null: false, foreign_key: true
      t.date :issue_date, default: -> { 'CURRENT_DATE' }
      t.date :due_date
      t.decimal :subtotal, precision: 10, scale: 2, default: 0
      t.decimal :tax_rate, precision: 4, scale: 2, default: 0.08
      t.decimal :tax_amount, precision: 10, scale: 2, default: 0
      t.decimal :total_amount, precision: 10, scale: 2, default: 0
      t.string :status, default: 'pending'
      t.string :payment_terms, default: 'Net 30'
      t.text :notes

      t.timestamps
    end
    
    add_index :invoices, :invoice_number, unique: true
  end
end 