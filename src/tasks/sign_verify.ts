import _sodium from "libsodium-wrappers-sumo"
import async_helpers from "promised-callback"
import Crypto from "../"

export async function sign_data(
  private_key: string,
  data: any,
  callback?: (err?: any, response?: Buffer) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      await _sodium.ready
      const sodium = _sodium

      const type = await Crypto.get_data_type(data).catch(error)
      // if not Buffer already, make it a Buffer
      if (type !== "bytes") {
        if (type === "message") {
          data = Buffer.from(JSON.stringify(data))
        } else {
          data = Buffer.from(data.toString())
        }
      }

      const signed_data = await sodium.crypto_sign_detached(data, sodium.from_hex(private_key))
      done(sodium.to_hex(signed_data))
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
      await _sodium.ready
      const sodium = _sodium

      const type = await Crypto.get_data_type(signed_data).catch(error)
      // if not Buffer already, make it a Buffer
      if (type !== "bytes") {
        if (type === "message") {
          signed_data = Buffer.from(JSON.stringify(signed_data))
        } else {
          signed_data = Buffer.from(signed_data.toString())
        }
      }

      const is_valid = await sodium.crypto_sign_verify_detached(
        sodium.from_hex(signature),
        signed_data,
        sodium.from_hex(public_key),
      )
      done(is_valid)
    } catch (err) {
      error(err)
    }
  })
}
