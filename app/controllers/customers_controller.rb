class CustomersController < ApplicationController
  def index
    @customers = Customer.all
    
    respond_to do |format|
      format.html
      format.csv { send_data DataExportService.to_csv(@customers), filename: "customers-#{Date.today}.csv" }
      format.json { send_data DataExportService.to_json(@customers), filename: "customers-#{Date.today}.json" }
      format.xml { send_data DataExportService.to_xml(@customers), filename: "customers-#{Date.today}.xml" }
    end
  end

  def show
    @customer = Customer.find(params[:id])
    @mailing_documents = @customer.mailing_documents
  end

  def new
    @customer = Customer.new
  end

  def create
    @customer = Customer.new(customer_params)
    if @customer.save
      redirect_to customers_path, notice: 'Customer was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def customer_params
    params.require(:customer).permit(:name, :email, :address, :phone)
  end
end
