import fs from "fs"
import Crypto from "../src"
function unexpected_error(err: any) {
  expect(err).toBeNull()
}

describe("Keys", () => {
  test("should generate master key that can derive subkeys", async () => {
    const master_key = await Crypto.generate_master_key().catch(unexpected_error)
    expect(master_key.length).toEqual(64)

    const known_master_key = "dc1045f79cee141bea070310b00505332ef9341db4888ae76d49b0fc06a9b5c8"
    const sub_key = await Crypto.derive_subkey(known_master_key, 1, "TEST").catch(unexpected_error)
    expect(sub_key).toEqual(
      // tslint:disable-next-line:max-line-length
      "8b4d900eab8ba5a70fd0457222ed331183076f44d562cab8201e05af756085472e4fae449acef8c919427774c94d0314ffb7a20e4abc232aa1767a0ddf83f6d7",
    )
  })

  test("should generate valid public and private key pair", async () => {
    const keypair = await Crypto.generate_keys().catch(unexpected_error)
    expect(keypair).toHaveProperty("public")
    expect(keypair).toHaveProperty("private")
  })

  test("should be able to derive public key from private key", async () => {
    const keypair = await Crypto.generate_keys().catch(unexpected_error)
    const public_key = await Crypto.derive_public_key(keypair.private)
    expect(keypair.public).toEqual(public_key)
  })
})

describe("Signing and Verification", () => {
  let keypair: { private: string, public: string } = { private: "", public: "" }
  beforeAll(async (done) => {
    keypair = await Crypto.generate_keys().catch(unexpected_error)
    done()
  })
  test("should sign and verify text (await/async & callback)", async () => {
    const text = "How to paint endless paintings 101: [todo: the rest]"
    const signed_text = await Crypto.sign_data(keypair.private, text)
    expect(typeof signed_text).toEqual("string")
    const verified_text = await Crypto.verify_data(signed_text, text, keypair.public)
    expect(verified_text).toBeTruthy()
  })

  test("should sign and verify json (await/async & callback)", async () => {
    const json = { foo: "bar " }
    const signed_json = await Crypto.sign_data(keypair.private, json)
    expect(typeof signed_json).toEqual("string")
    const verified_json = await Crypto.verify_data(signed_json, json, keypair.public)
    expect(verified_json).toBeTruthy()
  })

  test("should sign and verify integers and floats (await/async & callback)", async () => {
    const int = 4
    const signed_int = await Crypto.sign_data(keypair.private, int)
    expect(typeof signed_int).toEqual("string")
    const verified_int = await Crypto.verify_data(signed_int, int, keypair.public)
    expect(verified_int).toBeTruthy()

    const float = 4.00000002
    const signed_float = await Crypto.sign_data(keypair.private, float)
    expect(typeof signed_float).toEqual("string")
    const verified_float = await Crypto.verify_data(signed_float, float, keypair.public)
    expect(verified_float).toBeTruthy()
  })

  test("should sign and verify binary (await/async & callback)", async () => {
    const bin = fs.readFileSync(__dirname + "/photo.jpg")
    const signed_bin = await Crypto.sign_data(keypair.private, bin)
    expect(typeof signed_bin).toEqual("string")
    const verified_bin = await Crypto.verify_data(signed_bin, bin, keypair.public)
    expect(verified_bin).toBeTruthy()
  })
  
  test("should fail to sign and verify text with bad key", async () => {
    const text = "How to paint endless paintings 101: [todo: the rest]"
    const signed_text = await Crypto.sign_data(keypair.private, text)
    const wrong_keypair = await Crypto.generate_keys().catch(unexpected_error)
    expect(typeof signed_text).toEqual("string")
    await Crypto.verify_data(signed_text, text, wrong_keypair.public).catch((err: any) => {
      expect(err).toBeTruthy()
    })
  })
})
