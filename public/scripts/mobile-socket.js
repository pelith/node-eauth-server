class SetupSocket {
  constructor() {
    this.qrcode = document.getElementById('qrcode')
    this.timerNumber = document.querySelector('.timer__number')

    this.socket = io()
    this.socket.on('init', this.handleSocketInit.bind(this))
    this.socket.on('refresh', this.handleSocketRefresh.bind(this))
  }
  
  handleSocketInit(data) {
    this.runTimer()
    const url = new URL(document.URL)
    const walletAddr = url.searchParams.get('wallet')
    const renderUrl = `https://${document.domain}${window.location.pathname}/?socket_id=${this.socket.id}&session_id=${data.session_id}&wallet=${walletAddr}`
    this.renderQRCode(renderUrl)
  }

  handleSocketRefresh() {
    const url = new URL(window.location.href)
    window.location = url.searchParams.get('url') || url
  }

  renderQRCode(text) {
    this.qrcode.style.display = ""
    this.qrcode.innerHTML = null
    return new QRCode(this.qrcode, {
      text,
      errorCorrectionLevel: 'H',
      width: 160,
      height: 160,
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

window.socket = new SetupSocket()
