import fs from "fs"
import { Stream } from "stream"
import Crypto from "../src/"

describe("Data", () => {
  test("should encrypt and decrypt a stream of binary data with a preset key", async (done) => {
    // Apologies for anybody who has to read this test...

    const readableStreamEncrypt = new Stream.Readable()
    const writableStreamEncrypt = new Stream.Writable()
    const readableStreamDecrypt = new Stream.Readable()
    const writableStreamDecrypt = new Stream.Writable()

    const bin = fs.readFileSync(__dirname + "/photo.jpg")

    let creds: any = {}
    const encrypted_buffer: Uint8Array[] = []
    const decrypted_buffer: Uint8Array[] = []
    function credentials_callback(err: null, credentials?: { key: string; header: string }) {
      creds = credentials
      expect(creds.header).toBeDefined()
      expect(creds.key).toEqual(key)
    }

    const key = await Crypto.generate_random_string(64)
    const stream_encryptor = Crypto.encrypt_stream_with_key(key, credentials_callback)

    readableStreamEncrypt.pipe(stream_encryptor).pipe(writableStreamEncrypt)
    writableStreamEncrypt._write = (data: any | object) => {
      if (data) {
        expect(typeof data).toEqual("object")
        encrypted_buffer.push(data)
      }
    }
    stream_encryptor.on("finish", () => {
      const encrypted_combined = Buffer.concat(encrypted_buffer)
      expect(typeof encrypted_combined).toEqual("object")
      const stream_decryptor = Crypto.decrypt_stream_with_key(creds.key, creds.header)
      readableStreamDecrypt.pipe(stream_decryptor).pipe(writableStreamDecrypt)
      writableStreamDecrypt._write = (data: any | object) => {
        if (data) {
          expect(typeof data).toEqual("object")
          decrypted_buffer.push(data)
        }
      }

      stream_decryptor.on("finish", () => {
        const decrypted_combined = Buffer.concat(decrypted_buffer)
        expect(typeof decrypted_combined).toEqual("object")
        expect(decrypted_combined).toEqual(bin)
        done()
      })
      readableStreamDecrypt.push(encrypted_combined)
      readableStreamDecrypt.push(null)
    })
    readableStreamEncrypt.push(bin)
    readableStreamEncrypt.push(null)
  })

  test("should encrypt and decrypt text with preset key", async () => {
    const key = await Crypto.generate_random_string(64)
    const text = "How to paint endless paintings 101: [todo: the rest]"
    const encrypted_text = await Crypto.encrypt_data_with_key(key, text)
    expect(encrypted_text).toHaveProperty("encrypted_data")
    expect(encrypted_text).toHaveProperty("password")
    expect(encrypted_text.password).toHaveLength(113)
    expect(encrypted_text.password.slice(0, 64)).toEqual(key)
    const decrypted_text = await Crypto.decrypt_data(encrypted_text.encrypted_data, encrypted_text.password)
    expect(decrypted_text).toEqual(text)
  })

  test("should encrypt and decrypt text", async () => {
    const text = "How to paint endless paintings 101: [todo: the rest]"
    const encrypted_text = await Crypto.encrypt_data(text)
    expect(encrypted_text).toHaveProperty("encrypted_data")
    expect(encrypted_text).toHaveProperty("password")
    expect(encrypted_text.password).toHaveLength(113)
    const decrypted_text = await Crypto.decrypt_data(encrypted_text.encrypted_data, encrypted_text.password)
    expect(decrypted_text).toEqual(text)
  })

  test("should encrypt and decrypt json", async () => {
    const json = { foo: "bar " }
    const encrypted_json = await Crypto.encrypt_data(json)
    expect(encrypted_json).toHaveProperty("encrypted_data")
    expect(encrypted_json).toHaveProperty("password")
    expect(encrypted_json.password).toHaveLength(113)
    const decrypted_json = await Crypto.decrypt_data(encrypted_json.encrypted_data, encrypted_json.password)
    expect(decrypted_json).toEqual(json)
  })

  test("should encrypt and decrypt integers and floats", async () => {
    const int = 4
    const encrypted_int = await Crypto.encrypt_data(int)
    expect(encrypted_int).toHaveProperty("encrypted_data")
    expect(encrypted_int).toHaveProperty("password")
    expect(encrypted_int.password).toHaveLength(113)
    const decrypted_int = await Crypto.decrypt_data(encrypted_int.encrypted_data, encrypted_int.password)
    expect(decrypted_int).toEqual(int)

    const float = 4.00000002
    const encrypted_float = await Crypto.encrypt_data(float)
    expect(encrypted_float).toHaveProperty("encrypted_data")
    expect(encrypted_float).toHaveProperty("password")
    expect(encrypted_float.password).toHaveLength(113)
    const decrypted_float = await Crypto.decrypt_data(encrypted_float.encrypted_data, encrypted_float.password)
    expect(decrypted_float).toEqual(float)
  })

  test("should encrypt and decrypt binary (await/async & callback)", async () => {
    const bin = fs.readFileSync(__dirname + "/photo.jpg")
    const encrypted_bin = await Crypto.encrypt_data(bin)
    expect(encrypted_bin).toHaveProperty("encrypted_data")
    expect(encrypted_bin).toHaveProperty("password")
    expect(encrypted_bin.password).toHaveLength(113)
    const decrypted_bin = await Crypto.decrypt_data(encrypted_bin.encrypted_data, encrypted_bin.password)
    expect(decrypted_bin).toEqual(bin)
  })
})
