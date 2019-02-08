import async_helpers from "promised-callback"
import sodium from "sodium-universal"

export async function hash(PASSWORD: string, callback?: (err?: any, response?: string) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      const OPSLIMIT: number = sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE
      const MEMLIMIT: number = sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE

      const hashed_password: Buffer = Buffer.alloc(sodium.crypto_pwhash_STRBYTES)

      sodium.crypto_pwhash_str_async(hashed_password, Buffer.from(PASSWORD), OPSLIMIT, MEMLIMIT, () => {
        done(hashed_password.toString("hex"))
      })
    } catch (err) {
      error(err)
    }
  })
}

export async function verify(
  PASSWORD: string,
  HASH: string,
  callback?: (err?: any, response?: boolean) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      const hash_buffer = Buffer.from(HASH, "hex")
      if (hash_buffer.length !== sodium.crypto_pwhash_STRBYTES) {
        return error(new Error("BAD_HASH"))
      }

      sodium.crypto_pwhash_str_verify_async(hash_buffer, Buffer.from(PASSWORD), (err: any, is_verified: boolean) => {
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

export default { hash, verify }
