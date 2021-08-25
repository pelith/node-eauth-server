class LoginApp {
  constructor() {
    this.contractWallet = document.querySelector('.input--contract')
    this.eauthButton = document.querySelector('.button--contractinput')

    this.eauthButton.addEventListener('click', this.useContractWallet.bind(this))
    document.addEventListener('keydown', this.submit.bind(this))
  }

  useContractWallet() {
    const url = new URL(window.location.href)
    const c = url.searchParams.get('url')
    const walletAddress = this.contractWallet.value.replace(/ /g, '')
    if (/^(0x)?[0-9a-f]{40}$/i.test(walletAddress) || /.*\.eth$/.test(walletAddress)) {
      if (c) {
        window.location = `/contractLogin?url=${encodeURIComponent(c)}&wallet=${walletAddress}`
      } else {
        window.location = `/contractLogin?wallet=${walletAddress}`
      }
    } else {
      window.toastr.warning('not a valid address')
    }
  }

  submit() {
    if (event.keyCode === 13) { // Enter
      this.useContractWallet()
    }
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
