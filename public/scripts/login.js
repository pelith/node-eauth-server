class LoginApp {
  constructor() {
    this.eauthButton = document.querySelector('.button--eauth')
    this.fortmaticButton = document.querySelector('.button--fortmatic')
    this.qrcode = document.getElementById('qrcode')
    this.timerNumber = document.querySelector('.timer__number')

    this.eauth = new Eauth({
      AUTH_ROUTE: '/auth',
    })

    this.eauthButton.addEventListener('click', this.loginWithEauth.bind(this))
    this.fortmaticButton.addEventListener('click', this.loginWithFortmatic.bind(this))

    this.socket = io()
    this.socket.on('init', this.handleSocketInit.bind(this))
    this.socket.on('refresh', this.handleSocketRefresh.bind(this))

    this.runTimer()
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

  handleSocketInit(data) {
    const url = `https://${document.domain}/login/?socket_id=${this.socket.id}&session_id=${data.session_id}`
    this.renderQRCode(url)
  }

  handleSocketRefresh() {
    const url = new URL(window.location.href)
    window.location = url.searchParams.get('url') || '/'
  }

  renderQRCode(text) {
    this.qrcode.innerHTML = null
    return new QRCode(this.qrcode, {
      text,
      errorCorrectionLevel: 'H',
      width: 170,
      height: 170,
    })
  }

  runTimer() {
    this.timer = new Timer()
    this.timer.start({ countdown: true, startValues: { seconds: 180 } })
    this.timerNumber.textContent = this.timer.getTimeValues().toString(['minutes', 'seconds'])
    this.timer.addEventListener('secondsUpdated', () => {
      this.timerNumber.textContent = this.timer.getTimeValues().toString(['minutes', 'seconds'])
    })
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
