class CreatePrompts < ActiveRecord::Migration[7.0]
  def change
    create_table :prompts do |t|
      t.string :name, null: false
      t.text :content, null: false
      t.string :category, null: false
      t.boolean :active, default: true
      t.text :description
      t.jsonb :parameters, default: {}
      t.integer :version, default: 1

      t.timestamps
    end

    add_index :prompts, :category
    add_index :prompts, [:category, :active]
  end
end 