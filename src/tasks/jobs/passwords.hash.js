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