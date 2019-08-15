class LoginApp {
  constructor() {
    this.contractWallet = document.querySelector('.input--contract')
    this.eauthButton = document.querySelector('.button--eauth')
    this.fortmaticButton = document.querySelector('.button--fortmatic')

    this.eauth = new Eauth({
      CONTRACT_AUTH_ROUTE: '/auth/contract',
    })

    this.eauthButton.addEventListener('click', this.loginWithEauth.bind(this))
    this.fortmaticButton.addEventListener('click', this.loginWithFortmatic.bind(this))
  }

  authorise() {
    const url = new URL(document.URL)
    let location = '/contractLogin'
    const c = url.searchParams.get('url')
    if (c) {
      location = c
    }
    window.location = location
  }

  loginWithEauth() {
    this.eauth.contractEthLogin(this.contractWallet.value, this.authorise)
  }

  loginWithFortmatic() {
    this.eauth.contractFortmaticLogin(this.contractWallet.value, this.authorise)
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
