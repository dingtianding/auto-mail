class ImportsController < ApplicationController
  def new
  end

  def create
    if params[:file].nil?
      redirect_to new_import_path, alert: 'Please select a file'
      return
    end

    results = case File.extname(params[:file].original_filename)
    when '.csv'
      DataImportService.import_csv(params[:file])
    when '.json'
      DataImportService.import_json(params[:file])
    when '.xml'
      DataImportService.import_xml(params[:file])
    else
      redirect_to new_import_path, alert: 'Unsupported file format'
      return
    end

    flash[:notice] = "Imported #{results[:imported]} customers. Failed: #{results[:failed]}"
    flash[:error] = results[:errors].join("\n") if results[:errors].any?
    redirect_to customers_path
  end
end 