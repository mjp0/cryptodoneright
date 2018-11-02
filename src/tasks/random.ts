import _sodium from "libsodium-wrappers-sumo"
import async_helpers from "promised-callback"

export async function random_string(length: number, callback?: (err?: any, response?: string) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      await _sodium.ready
      const sodium = _sodium
      const random_buf = await sodium.randombytes_buf(length)
      done(await sodium.to_hex(random_buf).slice(0, length))
    } catch (err) {
      error(err)
    }
  })
}
