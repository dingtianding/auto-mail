Rails.application.routes.draw do
  root 'customers#index'
  
  resources :customers do
    resources :mailing_documents, only: [:create, :show]
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
