const ENS = require('ethereum-ens')
const { default: async } = require('async')

module.exports = function() {
  this.ens = new ENS(process.env.EAUTH_RPC_URL)

  this.reverse = async function(address) {
    let ens_name = null
    try {
      const reverse_name = await this.ens.reverse(address).name()
      const reverse_address = await this.ens.resolver(reverse_name).addr()

      // Check to be sure the reverse record is correct.
      if (address.toLowerCase() == reverse_address.toLowerCase())
        ens_name = reverse_name
    } catch (e) {
      console.log('ENS reverse error:' + e)
    }

    return ens_name
  }

  this.reverseName = async function(name) {
    let ens_address = null
    try {
      ens_address =  await this.ens.resolver(name).addr()
    } catch (e) {
      console.log('ENS reverseName error:' + e)
    }
  
    return ens_address
  }
}
