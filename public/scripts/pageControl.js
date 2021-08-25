function backToLastPage() {
  if (window.history.length < 3) {
    window.location = '/'
  } else {
    window.history.back()
  }
}

if (document.querySelector('.back')) {
  const lastPage = document.querySelector('.back')
  lastPage.addEventListener('click', backToLastPage)
}
