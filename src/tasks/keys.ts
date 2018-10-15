import _sodium from "libsodium-wrappers-sumo"
import async_helpers from "promised-callback"

export async function generate_master_key(
  callback?: (err?: any, response?: string) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      await _sodium.ready
      const sodium = _sodium
      const master_key = await sodium.crypto_kdf_keygen()
      done(await sodium.to_hex(master_key))
    } catch (err) {
      error(err)
    }
  })
}

export async function derive_subkey(
  master_key: string,
  subkey_id_number: number,
  subkey_name: string,
  callback?: (err?: any, response?: string) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      await _sodium.ready
      const sodium = _sodium
      const sub_key = await sodium.crypto_kdf_derive_from_key(
        64,
        subkey_id_number,
        subkey_name,
        sodium.from_hex(master_key),
      )
      done(await sodium.to_hex(sub_key))
    } catch (err) {
      error(err)
    }
  })
}

export async function generate(
  seed?: string,
  callback?: (err?: any, response?: { public: string; private: string }) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      await _sodium.ready
      const sodium = _sodium
      const rand = await sodium.randombytes_buf(sodium.crypto_sign_SEEDBYTES)
      const raw_keys = await sodium.crypto_sign_seed_keypair(rand)
      const keys = {
        type: raw_keys.keyType,
        private: await sodium.to_hex(raw_keys.privateKey),
        public: await sodium.to_hex(raw_keys.publicKey),
      }
      done(keys)
    } catch (e) {
      error(e)
    }
  })
}

export async function derive_public_key(
  private_key: string,
  callback?: (err?: any, response?: string) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      await _sodium.ready
      const sodium = _sodium
      const public_key = await sodium.crypto_sign_ed25519_sk_to_pk(Buffer.from(private_key, "hex"))
      done(await sodium.to_hex(public_key))
    } catch (err) {
      error(err)
    }
  })
}

export default {
  generate,
}
