const fulladdress = document.querySelector('#fulladdress').textContent
const address = document.getElementById('address')

const prefixAddress = fulladdress.slice(0, 8)
const suffixAddress = fulladdress.slice(fulladdress.length - 8, fulladdress.length)
const partialAddress = `${prefixAddress}...${suffixAddress}`

address.addEventListener('click', showFullAddress)
address.style.display = null;

function showFullAddress() {
  if (fulladdress.length > 18 && address.textContent === fulladdress)
    address.textContent = partialAddress
  else
    address.textContent = fulladdress
}

if (fulladdress.length > 18) address.textContent = partialAddress
else showFullAddress()
