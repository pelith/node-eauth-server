class LoginApp {
  constructor() {
    this.contractWallet = document.querySelector('#fulladdress').innerHTML
    this.verifyButton = document.querySelector('.button--verify')
    this.message = document.querySelector('.message')
    this.messageHex = document.querySelector('.messageHex')
    this.copyOrig = document.querySelector('#copyMessage')
    this.copyHex = document.querySelector('#copyHexMessage')

    this.eauth = new Eauth({
      CONTRACT_AUTH_ROUTE: '/customizedsign',
      PREFIX: prefix,
    })

    this.eauth.getMessage(this.contractWallet).then(msg => {
      this.message.innerHTML = msg
      return msg
    }).then(orgiMsg => {
      const web3 = new Web3()
      this.messageHex.innerHTML = web3.sha3(orgiMsg)
    })
    
    this.copyOrig.addEventListener('click', this.copyMessage.bind(this))
    this.copyHex.addEventListener('click', this.copyHexMessage.bind(this))
    this.verifyButton.addEventListener('click', this.checkIsValid.bind(this))
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

    if (!this.eauth.AUTH_RESPONSE || !JSON.parse(this.eauth.AUTH_RESPONSE).success) {
      alert('Authentication failed.')
      window.location.reload()
    } else {
      window.location = location
    }
  }

  checkIsValid() {
    const signature = document.querySelector('.signature').value
    this.eauth.checkIsValid(this.message.value, signature, this.authorise.bind(this))
  }

  copyMessage() {
    this.message.select()
    document.execCommand("copy")
  }

  copyHexMessage() {
    this.messageHex.select()
    document.execCommand("copy")
  }
}

window.onload = () => {
  console.log('You can try it out with web3.eth.sign(web3.eth.accounts[0], web3.sha3(`Message`), console.log) or web3.eth.sign(web3.eth.accounts[0], `Message Hex`, console.log) and copy the signature')
  window.app = new LoginApp()
}
