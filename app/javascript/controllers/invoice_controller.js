import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["lineItems", "template"]

  connect() {
    this.updateLineItemEvents()
  }

  addLineItem(event) {
    event.preventDefault()
    const content = this.templateTarget.innerHTML
    const timestamp = new Date().getTime()
    const newContent = content.replace(/NEW_RECORD/g, timestamp)
    this.lineItemsTarget.insertAdjacentHTML('beforeend', newContent)
  }

  removeLineItem(event) {
    event.preventDefault()
    const item = event.target.closest('.line-item')
    if (this.lineItemsTarget.children.length > 1) {
      item.remove()
    } else {
      alert('At least one line item is required')
    }
  }

  updateLineItemEvents() {
    this.lineItemsTarget.querySelectorAll('.remove-line-item').forEach(button => {
      button.addEventListener('click', this.removeLineItem.bind(this))
    })
  }
} 