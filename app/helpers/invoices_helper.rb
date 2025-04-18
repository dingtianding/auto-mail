module InvoicesHelper
  def link_to_add_line_item(name, form, association)
    new_object = form.object.send(association).klass.new
    id = new_object.object_id
    fields = form.fields_for(association, new_object, child_index: id) do |builder|
      render(association.to_s.singularize + "_fields", f: builder)
    end
    link_to(name, '#', class: "add_fields btn btn-secondary", 
      data: {id: id, fields: fields.gsub("\n", "")})
  end
end 