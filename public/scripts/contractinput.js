class LoginApp {
  constructor() {
    this.contractWallet = document.querySelector('.input--contract')
    this.eauthButton = document.querySelector('.button--eauth')

    this.eauthButton.addEventListener('click', this.useContractWallet.bind(this))
  }

  useContractWallet() {
    const url = new URL(window.location.href)
    const c = url.searchParams.get('url')
    if (this.contractWallet.value) {
      if (c) {
        window.location = `/contractLogin?url=${encodeURIComponent(c)}&wallet=${this.contractWallet.value}`
      } else {
        window.location = `/contractLogin?wallet=${this.contractWallet.value}`
      }
    } else {
      window.location = url
    }
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
