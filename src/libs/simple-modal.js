let modalWrapper = null
const _ = document.querySelector('#alertModal')

if (_) {
  modalWrapper = _
} else {
  modalWrapper = document.createElement('div')
  modalWrapper.classList.add('modal')
  modalWrapper.classList.add('fade')
  modalWrapper.setAttribute('id', 'alertModal')
  modalWrapper.setAttribute('role', 'dialog')
  modalWrapper.setAttribute('aria-labelledby', 'alertModal')
  modalWrapper.setAttribute('aria-hidden', 'true')

  const modalDialogEl = document.createElement('div')
  modalDialogEl.classList.add('modal-dialog')

  const modalContentEl = document.createElement('div')
  modalContentEl.classList.add('modal-content')

  modalDialogEl.appendChild(modalContentEl)
  modalWrapper.appendChild(modalDialogEl)
  document.body.appendChild(modalWrapper)
}

export default function open(title, content, footer) {
  const modal = new Modal(modalWrapper, {
    content: `
      <div class="modal-header">
        <h4 class="modal-title">${title}</h4>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer">
        ${footer}
      </div>
    `
  })
  modal.open()
}