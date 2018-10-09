// import sodium from "sodium-universal"
import _sodium from "libsodium-wrappers-sumo"
import async_helpers from "promised-callback"

export async function encrypt(data: Buffer, callback?: (err?: any, response?: Buffer) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, callback)

    await _sodium.ready
    const sodium = _sodium

    const key = sodium.crypto_secretstream_xchacha20poly1305_keygen()
    const res = sodium.crypto_secretstream_xchacha20poly1305_init_push(key)
    const [ state_out, nonce ] = [ res.state, res.header ]
    const encrypted_data = sodium.crypto_secretstream_xchacha20poly1305_push(
      state_out,
      data,
      null,
      sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL,
    )

    done({
      encrypted_data,
      key: sodium.to_hex(key),
      nonce: sodium.to_hex(nonce),
    })
  })
}

export async function decrypt(
  encrypted_data: Buffer,
  key_hex: string,
  nonce_hex: string,
  callback?: (err?: any, response?: Buffer) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, callback)

    await _sodium.ready
    const sodium = _sodium

    const state_in = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
      sodium.from_hex(nonce_hex),
      sodium.from_hex(key_hex),
    )
    const r1 = sodium.crypto_secretstream_xchacha20poly1305_pull(state_in, encrypted_data)

    done(r1.message)
  })
}

export default { encrypt, decrypt }
