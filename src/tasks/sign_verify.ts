import async_helpers from "promised-callback"
import sodium from "sodium-universal"
import Crypto from "../"

export async function sign_data(
  private_key: string,
  data: any,
  callback?: (err?: any, response?: Buffer) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      const type = await Crypto.get_data_type(data).catch(error)
      // if not Buffer already, make it a Buffer
      if (type !== "bytes") {
        if (type === "message") {
          data = Buffer.from(JSON.stringify(data))
        } else {
          data = Buffer.from(data.toString())
        }
      }
      const signature = Buffer.alloc(sodium.crypto_sign_BYTES)
      sodium.crypto_sign_detached(signature, data, Buffer.from(private_key, "hex"))
      done(signature.toString("hex"))
    } catch (err) {
      error(err)
    }
  })
}

export async function verify_data(
  signature: string,
  signed_data: any,
  public_key: string,
  callback?: (err?: any, response?: boolean) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      const type = await Crypto.get_data_type(signed_data).catch(error)
      // if not Buffer already, make it a Buffer
      if (type !== "bytes") {
        if (type === "message") {
          signed_data = Buffer.from(JSON.stringify(signed_data))
        } else {
          signed_data = Buffer.from(signed_data.toString())
        }
      }

      const is_valid = sodium.crypto_sign_verify_detached(
        Buffer.from(signature, "hex"),
        signed_data,
        Buffer.from(public_key, "hex"),
      )
      done(is_valid)
    } catch (err) {
      error(err)
    }
  })
}
