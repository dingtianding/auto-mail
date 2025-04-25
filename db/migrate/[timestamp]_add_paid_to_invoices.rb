class AddPaidToInvoices < ActiveRecord::Migration[7.1]
  def change
    add_column :invoices, :paid, :boolean, default: false
    add_index :invoices, :paid
  end
end 