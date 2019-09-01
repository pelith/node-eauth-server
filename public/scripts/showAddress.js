const fulladdress = document.querySelector('#fulladdress').textContent
const address = document.getElementById('address')

const prefixAddress = fulladdress.slice(0, 8)
const suffixAddress = fulladdress.slice(fulladdress.length - 8, fulladdress.length)
const partialAddress = `${prefixAddress}...${suffixAddress}`
address.textContent = partialAddress


$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip()
})