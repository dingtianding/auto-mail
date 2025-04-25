module Api
  class PromptsController < Api::BaseController
    def index
      @prompts = Prompt.all
      render_success(@prompts)
    end

    def show
      @prompt = Prompt.find(params[:id])
      render_success(@prompt)
    end

    def create
      @prompt = Prompt.new(prompt_params)
      if @prompt.save
        render_success(@prompt, :created)
      else
        render_error(@prompt.errors.full_messages, :unprocessable_entity)
      end
    end

    def update
      @prompt = Prompt.find(params[:id])
      if @prompt.update(prompt_params)
        render_success(@prompt)
      else
        render_error(@prompt.errors.full_messages, :unprocessable_entity)
      end
    end

    def destroy
      @prompt = Prompt.find(params[:id])
      @prompt.destroy
      render_success({ message: 'Prompt deleted successfully' })
    end

    private

    def prompt_params
      params.require(:prompt).permit(:name, :content, :category, :active, :description, :parameters, :version)
    end
  end
end 