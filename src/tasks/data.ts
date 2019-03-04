import async_helpers from "promised-callback"
import sodium from "sodium-universal"

export async function encrypt(data: Buffer, callback?: (err?: any, response?: Buffer) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, callback)

    const key = Buffer.alloc(sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES)
    sodium.crypto_secretstream_xchacha20poly1305_keygen(key)

    const state = sodium.crypto_secretstream_xchacha20poly1305_state_new()
    const header = Buffer.alloc(sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES)
    sodium.crypto_secretstream_xchacha20poly1305_init_push(state, header, key)

    const edata_len = data.length + sodium.crypto_secretstream_xchacha20poly1305_ABYTES
    const encrypted_data = Buffer.alloc(edata_len)
    sodium.crypto_secretstream_xchacha20poly1305_push(
      state,
      encrypted_data,
      data,
      null,
      sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL,
    )
    done({
      encrypted_data,
      key: key.toString("hex"),
      header: header.toString("hex"),
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
    if (key_hex.length !== sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES * 2) {
      error({ key_hex: key_hex.length, required: sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES * 2})
      return
    }

    const { key, state, header } = await get_encryption_header(key_hex).catch(error)

    const edata_len = data.length + sodium.crypto_secretstream_xchacha20poly1305_ABYTES
    const encrypted_data = Buffer.alloc(edata_len)
    sodium.crypto_secretstream_xchacha20poly1305_push(
      state,
      encrypted_data,
      data,
      null,
      sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL,
    )

    done({
      encrypted_data,
      key: key.toString("hex"),
      header: header.toString("hex"),
    })
  })
}

export async function encrypt_chunk(chunk: any, state: any, finalize?: boolean): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, null)

    let TAG = sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
    if (finalize) {
      TAG = sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
    }
    const edata_len = chunk.length + sodium.crypto_secretstream_xchacha20poly1305_ABYTES
    const encrypted_data = Buffer.alloc(edata_len)
    sodium.crypto_secretstream_xchacha20poly1305_push(
      state,
      encrypted_data,
      chunk,
      null,
      TAG,
    )

    done(encrypted_data)
  })
}

export async function get_encryption_header(
  key_hex: string,
  callback?: (err?: any, response?: any) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    if (key_hex.length !== sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES * 2) {
      error("bad key length")
      return
    }

    const key = Buffer.from(key_hex, "hex")
    const header = Buffer.alloc(sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES)
    const state = sodium.crypto_secretstream_xchacha20poly1305_state_new()
    sodium.crypto_secretstream_xchacha20poly1305_init_push(state, header, key)
    done({ key, state, header })
  })
}

export async function decrypt(
  encrypted_data: Buffer,
  key_hex: string,
  header_hex: string,
  callback?: (err?: any, response?: Buffer) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, callback)

    const key = Buffer.from(key_hex, "hex")
    const header = Buffer.from(header_hex, "hex")
    const state = sodium.crypto_secretstream_xchacha20poly1305_state_new()
    sodium.crypto_secretstream_xchacha20poly1305_init_pull(state, header, key)

    const dedata_len = encrypted_data.length - sodium.crypto_secretstream_xchacha20poly1305_ABYTES
    const decrypted_data = Buffer.alloc(dedata_len)

    sodium.crypto_secretstream_xchacha20poly1305_pull(
      state,
      decrypted_data,
      sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL,
      encrypted_data,
    )
    done(decrypted_data)
  })
}

export async function get_decryption_header(
  key_hex: string,
  header_hex: string,
  callback?: (err?: any, response?: any) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    if (key_hex.length !== 64) {
      error("bad key length")
      return
    }

    const key = Buffer.from(key_hex, "hex")
    const header = Buffer.from(header_hex, "hex")

    const state = sodium.crypto_secretstream_xchacha20poly1305_state_new()
    sodium.crypto_secretstream_xchacha20poly1305_init_pull(state, header, key)

    done({ state })
  })
}

export async function decrypt_chunk(chunk: any, state: any, finalize?: boolean): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, null)

    let TAG = sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
    if (finalize) {
      TAG = sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
    }

    const dedata_len = chunk.length - sodium.crypto_secretstream_xchacha20poly1305_ABYTES
    const decrypted_data = Buffer.alloc(dedata_len)

    sodium.crypto_secretstream_xchacha20poly1305_pull(
      state,
      decrypted_data,
      TAG,
      chunk,
    )

    done(decrypted_data)
  })
}

export default { encrypt, decrypt, encrypt_with_key }
