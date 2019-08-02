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

  loginWithEauth() {
    this.eauth.ethLogin()
  }

  loginWithFortmatic() {
    this.eauth.fortmaticLogin()
  }

  handleSocketInit(data) {
    const url = `https://${document.domain}/?socket_id=${this.socket.id}&session_id=${data.session_id}`
    this.renderQRCode(url)
  }

  handleSocketRefresh() {
    const url = new URL(window.location.href)
    window.location = url.searchParams.get('url') || '/'
  }

  renderQRCode(text) {
    return new QRCode(this.qrcode, {
      text,
      width: 100,
      height: 100,
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
