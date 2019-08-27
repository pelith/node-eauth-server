class LoginApp {
  constructor() {
    this.eauthButton = document.querySelector('.button--eauth')
    this.fortmaticButton = document.querySelector('.button--fortmatic')

    this.eauth = new Eauth({
      AUTH_ROUTE: '/auth',
      PREFIX: 'This is a prefix example\n\ntoken:\n----------\n',
    })

    this.eauthButton.addEventListener('click', this.loginWithEauth.bind(this))
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
    this.eauth.ethLogin(this.authorise)
  }

  loginWithFortmatic() {
    this.eauth.fortmaticLogin(this.authorise)
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
