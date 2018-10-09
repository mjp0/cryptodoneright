import _sodium from "libsodium-wrappers-sumo"
import async_helpers from "promised-callback"

export async function hash(PASSWORD: string, callback?: (err?: any, response?: string) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      await _sodium.ready
      const sodium = _sodium

      const OPSLIMIT: number = sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE
      const MEMLIMIT: number = sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE

      const hashed_password: string = sodium.crypto_pwhash_str(PASSWORD, OPSLIMIT, MEMLIMIT)
      done(hashed_password)
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
      await _sodium.ready
      const sodium = _sodium

      const is_verified: boolean = sodium.crypto_pwhash_str_verify(HASH, PASSWORD)
      done(is_verified)
    } catch (err) {
      error(err)
    }
  })
}

export default { hash, verify }
