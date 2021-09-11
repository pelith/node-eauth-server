class LoginApp {
  constructor() {
    this.normalButton = document.querySelector('.button--normal')
    this.contractButton = document.querySelector('.button--contract')
    this.normalButton.disabled = false
    this.contractButton.disabled = false

    this.normalButton.addEventListener('click', this.normalWallet.bind(this))
    this.contractButton.addEventListener('click', this.contractWallet.bind(this))
  }

  normalWallet() {
    const url = new URL(document.URL)
    const c = url.searchParams.get('url')
    let location = `/login`
    if (c) {
      location = `/login?url=${encodeURIComponent(c)}`
    }
    window.location = location
  }

  contractWallet() {
    const url = new URL(document.URL)
    const c = url.searchParams.get('url')
    let location = `/contractLogin`
    if (c) {
      location = `/contractLogin?url=${encodeURIComponent(c)}`
    }
    window.location = location
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
