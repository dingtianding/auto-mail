class CreateMailingDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :mailing_documents do |t|
      t.text :content
      t.string :status, default: 'pending'
      t.references :customer, null: false, foreign_key: true

      t.timestamps
    end
  end
end 