const promcall = require("promised-callback").default
const sodium = require("sodium-universal")

module.exports = async function(input, done) {
  return await new Promise(async (resolve, reject) => {
    try {
      const { HASH, PASSWORD } = input
      const hash_buffer = Buffer.from(HASH, "hex")
      if (hash_buffer.length !== sodium.crypto_pwhash_STRBYTES) {
        return error(new Error("BAD_HASH"))
      }

      sodium.crypto_pwhash_str_verify_async(hash_buffer, Buffer.from(PASSWORD), (err, is_verified) => {
        if (err) {
          return error(err)
        }
        done(is_verified)
      })
    } catch (err) {
      error(err)
    }
  })
}
