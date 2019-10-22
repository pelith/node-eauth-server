class LoginApp {
  constructor() {
    this.eauthButton = document.querySelector('.button--eauth')
    this.fortmaticButton = document.querySelector('.button--fortmatic')

    this.eauth = new Eauth({
      AUTH_ROUTE: '/auth',
      PREFIX: prefix,
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

    if (!this.eauth.AUTH_RESPONSE) {
      alert('Authentication failed.')
      window.location.reload()
    } else {
      window.location = location
    }
  }

  loginWithEauth() {
    this.eauth.ethLogin(this.authorise.bind(this))
  }

  loginWithFortmatic() {
    this.eauth.fortmaticLogin(this.authorise.bind(this))
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
