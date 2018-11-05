import _sodium from "libsodium-wrappers-sumo"
import async_helpers from "promised-callback"

export async function hash(text: string, callback?: (err?: any, response?: string) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      await _sodium.ready
      const sodium = _sodium
      const BYTES: number = sodium.crypto_generichash_BYTES
      const hashed_text = await sodium.crypto_generichash(BYTES, text)
      done(await sodium.to_hex(hashed_text))
    } catch (err) {
      error(err)
    }
  })
}
