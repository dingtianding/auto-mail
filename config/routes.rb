Rails.application.routes.draw do
  root 'customers#index'
  
  resources :customers do
    resources :invoices do
      member do
        post :generate_pdf
      end
    end
    resources :mailing_documents do
      member do
        post :regenerate
        get :preview
      end
    end
  end

  resources :imports, only: [:new, :create]

  namespace :api do
    resources :customers do
      collection do
        post :analyze
        post :import
        post :bulk_destroy
        get :export, defaults: { format: 'csv' }
      end
      resources :documents, controller: 'mailing_documents' do
        member do
          post :generate_pdf
          get :download
        end
      end
      resources :invoices do
        member do
          get :download
        end
      end
      resources :mailing_documents do
        member do
          get :regenerate
          get :download
        end
      end
    end
    resources :imports
    get 'dashboard/stats', to: 'dashboard#stats'
    post 'chat', to: 'chat#create'
    get 'imports/template/:type', to: 'imports#template'
    post 'imports/:type', to: 'imports#create'
    get 'exports/customers', to: 'exports#customers'
    get 'exports/documents', to: 'exports#documents'
    get '/customers.csv', to: 'customers#export'
    get '/dashboard', to: 'dashboard#index'
    resources :prompts
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
