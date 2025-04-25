class CustomersController < ApplicationController
  def index
    @customers = Customer.all
    
    respond_to do |format|
      format.html
      format.csv { send_data @customers.to_csv, filename: "customers-#{Date.today}.csv" }
      format.json { render json: @customers }
      format.xml { render xml: @customers }
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
