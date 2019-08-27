class LoginApp {
  constructor() {
    this.contractWallet = document.querySelector('#fulladdress').innerHTML
    this.eauthButton = document.querySelector('.button--eauth')
    this.fortmaticButton = document.querySelector('.button--fortmatic')
    this.customizedButton = document.querySelector('.button--customized')

    this.eauth = new Eauth({
      CONTRACT_AUTH_ROUTE: '/auth/contract',
      PREFIX: prefix,
    })

    this.eauthButton.addEventListener('click', this.loginWithEauth.bind(this))
    this.customizedButton.addEventListener('click', this.useCustomizedSign.bind(this))
    if (this.fortmaticButton)
      this.fortmaticButton.addEventListener('click', this.loginWithFortmatic.bind(this))
  }

  authorise() {
    const url = new URL(document.URL)
    let location = '/'
    const c = url.searchParams.get('url')
    const q = url.searchParams.get('socket_id')
    const s = url.searchParams.get('session_id')
    if (c) {
      location = c
    } else if (q && s) {
      location = '/api/qrcode?socket_id=' + q + '&session_id=' + s
    }
    window.location = location
  }

  loginWithEauth() {
    this.eauth.contractEthLogin(this.contractWallet, this.authorise)
  }

  loginWithFortmatic() {
    this.eauth.contractFortmaticLogin(this.contractWallet, this.authorise)
  }

  useCustomizedSign() {
    const url = new URL(document.URL)
    const c = url.searchParams.get('url')
    let location = `/customizedsign?wallet=${this.contractWallet}`
    if (c) {
      location = `/customizedsign?url=${encodeURIComponent(c)}&wallet=${this.contractWallet}`
    }
    window.location = location
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
