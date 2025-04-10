document.addEventListener('turbolinks:load', () => {
  document.addEventListener('click', (event) => {
    if (event.target.matches('.add_fields')) {
      event.preventDefault()
      const time = new Date().getTime()
      const regexp = new RegExp(event.target.dataset.id, 'g')
      const fields = event.target.dataset.fields.replace(regexp, time)
      document.querySelector('#line-items').insertAdjacentHTML('beforeend', fields)
    }
  })
}) 