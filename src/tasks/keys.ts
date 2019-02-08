import async_helpers from "promised-callback"
import sodium from "sodium-universal"

export async function generate_master_key(callback?: (err?: any, response?: string) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      const key = Buffer.alloc(sodium.crypto_kdf_KEYBYTES)
      sodium.crypto_kdf_keygen(key)
      done(key.toString("hex"))
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
      const context = Buffer.alloc(sodium.crypto_kdf_CONTEXTBYTES, subkey_name)
      const subkey = Buffer.alloc(sodium.crypto_kdf_BYTES_MAX)
      sodium.crypto_kdf_derive_from_key(subkey, subkey_id_number, context, Buffer.from(master_key, "hex"))

      done(subkey.toString("hex"))
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

      const rand = Buffer.alloc(sodium.crypto_sign_SEEDBYTES)
      sodium.randombytes_buf(rand)

      const key_pair = {
        publicKey: Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES),
        privateKey: Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES),
      }

      if (seed) {
        const digest = Buffer.alloc(32)
        sodium.crypto_generichash(digest, Buffer.from(seed))
        sodium.crypto_sign_seed_keypair(key_pair.publicKey, key_pair.privateKey, seed)
      } else {
        sodium.crypto_sign_keypair(key_pair.publicKey, key_pair.privateKey)
      }
      const keys = {
        type: "Ed25519",
        private: key_pair.privateKey.toString("hex"),
        public: key_pair.publicKey.toString("hex"),
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
      // TODO: IMPLEMENT THIS AGAIN - ATM SODIUM-NATIVE HAS NO SUPPORT FOR THIS METHOD
      // const public_key = await sodium.crypto_sign_ed25519_sk_to_pk(Buffer.from(private_key, "hex"))
      done(null)
    } catch (err) {
      error(err)
    }
  })
}

export default {
  generate,
}
