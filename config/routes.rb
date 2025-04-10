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

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
