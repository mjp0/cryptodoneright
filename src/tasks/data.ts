// import sodium from "sodium-universal"
import _sodium from "libsodium-wrappers-sumo"
import async_helpers from "promised-callback"

let global_sodium: any = null

export async function encrypt(data: Buffer, callback?: (err?: any, response?: Buffer) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, callback)
    if (!global_sodium) {
      await _sodium.ready
      global_sodium = _sodium
    }
    const sodium = global_sodium

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

export async function encrypt_with_key(
  data: Buffer,
  key_hex: string,
  callback?: (err?: any, response?: Buffer) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    if (key_hex.length !== 64) {
      error("bad key length")
      return
    }
    // const key = sodium.from_hex(key_hex)
    // const res = sodium.crypto_secretstream_xchacha20poly1305_init_push(key)
    // const [ state_out, nonce ] = [ res.state, res.header ]
    const { sodium, key, state_out, nonce } = await get_encryption_header(key_hex).catch(error)
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

export async function encrypt_chunk(chunk: any, state_out: any, finalize?: boolean): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, null)

    if (!global_sodium) {
      await _sodium.ready
      global_sodium = _sodium
    }
    const sodium = global_sodium

    let TAG = sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
    if (finalize) {
      TAG = sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
    }

    const encrypted_data = sodium.crypto_secretstream_xchacha20poly1305_push(state_out, chunk, null, TAG)
    done(encrypted_data)
  })
}

export async function get_encryption_header(
  key_hex: string,
  callback?: (err?: any, response?: any) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    if (key_hex.length !== 64) {
      error("bad key length")
      return
    }
    if (!global_sodium) {
      await _sodium.ready
      global_sodium = _sodium
    }
    const sodium = global_sodium

    const key = sodium.from_hex(key_hex)
    const res = sodium.crypto_secretstream_xchacha20poly1305_init_push(key)
    const [ state_out, nonce ] = [ res.state, res.header ]
    done({ sodium, key, res, state_out, nonce })
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

    if (!global_sodium) {
      await _sodium.ready
      global_sodium = _sodium
    }
    const sodium = global_sodium

    const state_in = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
      sodium.from_hex(nonce_hex),
      sodium.from_hex(key_hex),
    )
    const r1 = sodium.crypto_secretstream_xchacha20poly1305_pull(state_in, encrypted_data)

    done(r1.message)
  })
}

export async function get_decryption_header(
  key_hex: string,
  nonce_hex: string,
  callback?: (err?: any, response?: any) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    if (key_hex.length !== 64) {
      error("bad key length")
      return
    }
    if (!global_sodium) {
      await _sodium.ready
      global_sodium = _sodium
    }
    const sodium = global_sodium

    const state_in = sodium.crypto_secretstream_xchacha20poly1305_init_pull(
      sodium.from_hex(nonce_hex),
      sodium.from_hex(key_hex),
    )
    done({ sodium, state_in })
  })
}

export async function decrypt_chunk(chunk: any, state_in: any, finalize?: boolean): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, null)

    if (!global_sodium) {
      await _sodium.ready
      global_sodium = _sodium
    }
    const sodium = global_sodium

    const r1 = sodium.crypto_secretstream_xchacha20poly1305_pull(state_in, chunk)

    done(r1.message)
  })
}

export default { encrypt, decrypt, encrypt_with_key }
