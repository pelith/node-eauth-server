class LoginApp {
  constructor() {
    this.contractWallet = document.querySelector('.input--contract')
    this.eauthButton = document.querySelector('.button--contractinput')

    this.eauthButton.addEventListener('click', this.useContractWallet.bind(this))
  }

  useContractWallet() {
    const url = new URL(window.location.href)
    const c = url.searchParams.get('url')
    if (/^(0x)?[0-9a-f]{40}$/i.test(this.contractWallet.value)) {
      if (c) {
        window.location = `/contractLogin?url=${encodeURIComponent(c)}&wallet=${this.contractWallet.value}`
      } else {
        window.location = `/contractLogin?wallet=${this.contractWallet.value}`
      }
    } else {
      alert('not a valid address')
    }
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
