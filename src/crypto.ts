import async_helpers from "promised-callback"
import protobuf from "protobufjs"
// import { Stream } from "stream"
// import StreamChunkify from "stream-chunkify"
import through2 from "through2"
import * as datas from "./tasks/data"
import * as hashes from "./tasks/hash"
import * as keys from "./tasks/keys"
import pw from "./tasks/passwords"
import * as random from "./tasks/random"
import * as signverify from "./tasks/sign_verify"
// import { error } from "./utils"

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
      done(secured_password)
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

// COMMON HASHING///////////////////////////////////////////////////////////////////////////////////
export const hash = hashes.hash

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
      password: `${encrypted_data.key}|${encrypted_data.header}`,
    })
  })
}

export async function encrypt_data_with_key(
  key: string,
  data: any,
  callback?: (err?: any, response?: Buffer) => {},
): Promise<any> {
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

    const serialized_data = encrypted_data_schema.encode(encrypted_data_container).finish()

    const encrypted_data = await datas.encrypt_with_key(Buffer.from(serialized_data), key)

    done({
      encrypted_data: encrypted_data.encrypted_data,
      password: `${encrypted_data.key}|${encrypted_data.header}`,
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

    const [ key, header ] = password.split("|")

    const decrypted_data = await datas.decrypt(encrypted_data, key, header)

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

export function encrypt_stream_with_key(
  key: string,
  credentials_callback?: (err: any, credentials?: { key: string; header: string }) => void,
) {
  // const writableStream = new Stream.Writable()
  // const readableStream = new Stream.Readable()
  // writableStream.pipe(StreamChunkify(100)).pipe().pipe(readableStream)
  let session: any = {
    key: null,
    header: null,
    state: null,
  }

  const transform = async function(this: any, chunk: any, enc: any, callback: any) {
    let rev = Buffer.from("")
    if (chunk) {
      rev = await datas.encrypt_chunk(chunk, session.state).catch((error: any) => {
        throw new Error(error)
      })
    }
    this.push(rev)
    callback()
  }

  const flush = async function(this: any, next: any) {
    const rev = await datas.encrypt_chunk(Buffer.alloc(0), session.state, true).catch((error: any) => {
      throw new Error(error)
    })
    this.push(rev)
    // this.emit("finish")
  }
  const pipe = through2(transform, flush)
  pipe.pause()

  datas.get_encryption_header(key, (err: any, headers: any) => {
    if (err) {
      throw new Error(err)
    }
    session = headers

    if (typeof credentials_callback === "function") {
      credentials_callback(null, {
        key: session.key.toString("hex"),
        header: session.header.toString("hex"),
      })
    }
    pipe.resume()
  })

  return pipe
}

export function decrypt_stream_with_key(key_hex: string, header_hex: string) {
  let session: any = {
    state: null,
  }

  const transform = async function(this: any, chunk: any, enc: any, callback: any) {
    let decrypted_data = Buffer.from("")
    if (chunk) {
      decrypted_data = await datas.decrypt_chunk(chunk, session.state).catch((error: any) => {
        throw new Error(error)
      })
    }
    this.push(decrypted_data)
    callback()
  }

  const flush = async function(this: any) {
    this.emit("finished")
  }
  const pipe = through2(transform, flush)
  pipe.pause()

  datas.get_decryption_header(key_hex, header_hex, (err: any, headers: any) => {
    if (err) {
      throw new Error(err)
    }
    session = headers

    pipe.resume()
  })

  return pipe
}

// KEYS & SIGN & VERIFY /////////////////////////////////////////////////////////////////////////////
export async function generate_keys(
  seed?: string,
  callback?: (err?: any, response?: { public: string; private: string }) => any,
): Promise<any> {
  return await new Promise(async (resolve: any, reject: any) => {
    const { done, error } = async_helpers(resolve, reject, callback)
    const keypair = await keys.generate(seed || null).catch(error)
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
