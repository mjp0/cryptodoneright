import async_helpers from "promised-callback"
import sodium from "sodium-universal"

export async function hash(input: string|Buffer, callback?: (err?: any, response?: string) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done } = async_helpers(resolve, reject, callback)
    const hash = Buffer.alloc(sodium.crypto_generichash_BYTES)
    input = !Buffer.isBuffer(input) ? Buffer.from(input) : input
    sodium.crypto_generichash(hash, input)
    done(hash.toString("hex"))
  })
}
