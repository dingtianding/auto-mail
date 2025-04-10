
class CreateCustomers < ActiveRecord::Migration[7.0]
  def change
    create_table :customers do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :address
      t.string :phone

      t.timestamps
    end
    
    add_index :customers, :email, unique: true
  end
end