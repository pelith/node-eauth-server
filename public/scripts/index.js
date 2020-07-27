
const _LoadingHtml = '<div id="loadingDiv" style="display: none; "><div id="over" style=" position: absolute;top: 0;left: 0; width: 100%;height: 100%; background-color: #f5f5f5;opacity:0.5;z-index: 1000;"></div><div id="layout" style="position: absolute;top: 40%; left: 40%;width: 20%; height: 20%;  z-index: 1001;text-align:center;"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div></div>'

document.write(_LoadingHtml)
function completeLoading() {
  document.getElementById("loadingDiv").style.display="none"
}
function showLoading() {
  document.getElementById("loadingDiv").style.display="block"
}

class LoginApp {
  constructor() {
    this.ens = document.querySelector('.input--ens')
    this.normalButton = document.querySelector('.button--normal')
    this.normalButton.addEventListener('click', this.signIn.bind(this))
    document.addEventListener('keydown', this.submit.bind(this))
    this.eauth = new Eauth({
      ENS_ROUTE: '/ens',
    })
  }

  signIn() {
    showLoading()
    const url = new URL(document.URL)
    const c = url.searchParams.get('url')
    const ens = this.ens.value.replace(/ /g, '')
    
    this.eauth.submitENS(ens).then((ensInfo) => {
      if (!!ensInfo) {
        let location = `/login`
        if (ensInfo.isContract) {
          location = `/contractLogin`
        }

        if (c) {
          location = `${location}?url=${encodeURIComponent(c)}`
        }
        window.location = location
      }
      completeLoading()
    })

  }

  submit() {
    if (event.keyCode === 13) { // Enter
      this.signIn()
    }
  }
}

window.onload = () => {
  window.app = new LoginApp()
}
