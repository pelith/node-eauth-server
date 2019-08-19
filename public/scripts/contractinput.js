class LoginApp {
  constructor() {
    this.contractWallet = document.querySelector('.input--contract')
    this.eauthButton = document.querySelector('.button--eauth')

    this.eauthButton.addEventListener('click', this.useContractWallet.bind(this))
  }

  useContractWallet() {
    const url = new URL(window.location.href)
    if (this.contractWallet.value) {
      window.location = url + '?wallet=' + this.contractWallet.value
    } else {
      window.location = url
    }
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
