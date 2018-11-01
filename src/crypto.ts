import async_helpers from "promised-callback"
import protobuf from "protobufjs"
import * as datas from "./tasks/data"
import * as keys from "./tasks/keys"
import pw from "./tasks/passwords"
import * as random from "./tasks/random"
import * as signverify from "./tasks/sign_verify"

// PASSWORD HASHING ///////////////////////////////////////////////////////////////////////////////////
export async function secure_password(
  unsecured_password: string,
  callback?: (err?: any, response?: string) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    const secured_password = await pw.hash(unsecured_password)
    const is_secure_password = await pw.verify(unsecured_password, secured_password)
    if (is_secure_password) {
      done(secured_password.toString("hex"))
    } else {
      error("FAILURE_TO_VERIFY_HASH_CREATION")
    }
  })
}

export async function verify_password(
  input_password_str: string,
  secured_password_hex: string,
  callback?: (err?: any, response?: boolean) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    try {
      const result = await pw.verify(input_password_str, secured_password_hex)
      done(result)
    } catch (err) {
      error({ error: "PASSWORD_VERIFYING_FAIL", meta: { input_password_str, secured_password_hex } })
    }
  })
}

const encrypted_data_proto: any = new protobuf.Type("encrypted")
  .add(new protobuf.Field("type", 1, "string"))
  .add(new protobuf.Field("data", 2, "bytes"))
const proto_root = new protobuf.Root().define("data").add(encrypted_data_proto)
const encrypted_data_schema = proto_root.lookupType("data.encrypted")

// DATA ENCRYPTING AND DECRYPTING //////////////////////////////////////////////////////////////////
export async function encrypt_data(data: any, callback?: (err?: any, response?: Buffer) => {}): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)

    // What type of data it is?
    const type = await get_data_type(data).catch(error)

    // if not Buffer already, make it a Buffer
    if (type !== "bytes") {
      if (type === "message") {
        data = Buffer.from(JSON.stringify(data))
      } else {
        data = Buffer.from(data.toString())
      }
    }

    const encrypted_data_container = encrypted_data_schema.create({ data, type })

    // console.log(`message = ${JSON.stringify(message)}`)

    const serialized_data = encrypted_data_schema.encode(encrypted_data_container).finish()
    // console.log(`buffer = ${Array.prototype.toString.call(buffer)}`)

    const encrypted_data = await datas.encrypt(Buffer.from(serialized_data))

    done({
      encrypted_data: encrypted_data.encrypted_data,
      password: `${encrypted_data.key}|${encrypted_data.nonce}`,
    })
  })
}

export async function decrypt_data(
  encrypted_data: Buffer,
  password: string,
  callback?: (err?: any, response?: any) => {},
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)

    const [ key, nonce ] = password.split("|")

    const decrypted_data = await datas.decrypt(encrypted_data, key, nonce)

    const decrypted_data_container: any = encrypted_data_schema.decode(decrypted_data)
    let decrypted_decoded_data: any = decrypted_data_container.data
    if (decrypted_data_container.type !== Buffer) {
      switch (decrypted_data_container.type) {
        case "boolean":
          decrypted_decoded_data = (Buffer.from(decrypted_decoded_data).toString().match(/true/i) && true) || false
          break
        case "integer":
          decrypted_decoded_data = parseInt(Buffer.from(decrypted_decoded_data).toString(), 10)
          break
        case "float":
          decrypted_decoded_data = parseFloat(Buffer.from(decrypted_decoded_data).toString())
          break
        case "string":
          decrypted_decoded_data = Buffer.from(decrypted_decoded_data).toString()
          break
        case "bytes":
          decrypted_decoded_data = Buffer.from(decrypted_decoded_data)
          break
        case "message":
          decrypted_decoded_data = JSON.parse(Buffer.from(decrypted_decoded_data).toString())
          break
        default:
          error({
            error: "UNKNOWN_DATA_TYPE",
            meta: {
              type: decrypted_data_container.type,
              decrypted_data,
              decrypted_decoded_data,
            },
          })
          break
      }
    }
    done(decrypted_decoded_data)
  })
}

// KEYS & SIGN & VERIFY /////////////////////////////////////////////////////////////////////////////
export async function generate_keys(
  seed?: string,
  callback?: (err?: any, response?: { public: string; private: string }) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    const keypair = await keys.generate().catch(error)
    done(keypair)
  })
}

export const derive_public_key = keys.derive_public_key
export const generate_master_key = keys.generate_master_key
export const derive_subkey = keys.derive_subkey

export const sign_data = signverify.sign_data
export const verify_data = signverify.verify_data

// RANDOM STRINGS /////////////////////////////////////////////////////////////////////////////////

export const generate_random_string = random.random_string

// UTILITIES //////////////////////////////////////////////////////////////////////////////////////
export async function get_data_type(data: any, callback?: (err?: any, response?: string) => any): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    // We are not going to deal with nulls or undefined
    if (!data) {
      error("Data is either null or undefined. Can't work with that.")
      return
    }
    let type: string = typeof data
    switch (typeof data) {
      case "boolean":
        type = "bool"
        break
      case "number":
        type = "integer"

        // check if float
        if (Number(data) === data && data % 1 !== 0) {
          type = "float"
        }
        break
      case "string":
        type = "string"
        break
      case "object":
        // check if it's a buffer
        if (Buffer.isBuffer(data)) {
          type = "bytes"
        } else {
          type = "message"
        }
        break
      default:
        break
    }
    done(type)
  })
}
