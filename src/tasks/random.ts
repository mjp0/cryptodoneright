import async_helpers from "promised-callback"
import sodium from "sodium-universal"

export async function random_string(length: number, callback?: (err?: any, response?: string) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      const random_buf = Buffer.alloc(length * 4)
      sodium.randombytes_buf(random_buf)
      done(random_buf.toString("hex").slice(0, length))
    } catch (err) {
      error(err)
    }
  })
}
