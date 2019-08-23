class LoginApp {
  constructor() {
    const url = new URL(document.URL)
    this.contractWallet = url.searchParams.get('wallet')
    this.verifyButton = document.querySelector('.button--verify')
    this.message = document.querySelector('.message')
    this.messageHex = document.querySelector('.messageHex')

    this.eauth = new Eauth({
      CONTRACT_AUTH_ROUTE: '/customizedsign',
      PREFIX: 'This is a prefix example\n\ntoken:\n----------\n',
    })

    this.eauth.getMessage(this.contractWallet).then(msg => {
      this.message.innerHTML = msg
      return msg
    }).then(orgiMsg => {
      this.messageHex.innerHTML = web3.sha3(orgiMsg)
    })
    
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
    window.location = location
  }

  checkIsValid() {
    const signature = document.querySelector('.signature').value
    this.eauth.checkIsValid(this.message.value, signature, this.authorise)
  }
}

window.onload = () => {
  console.log('You can try it out with web3.eth.sign(web3.eth.accounts[0], web3.sha3(`Message`), console.log) or web3.eth.sign(web3.eth.accounts[0], `Message Hex`, console.log) and copy the signature')
  window.app = new LoginApp()
}
