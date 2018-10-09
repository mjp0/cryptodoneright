import fs from "fs"
import Crypto from "../src/"
describe("Crypto", () => {
  test("should generate valid secure password that verifies (await/async)", async () => {
    const secured_password = await Crypto.secure_password("L0NG4NDH4RDP455")
    expect(secured_password).toHaveLength(97)

    // Check that it generates different hashes
    const another_secured_password = await Crypto.secure_password("5KR1P7K1DD13Z")
    expect(another_secured_password === secured_password).toBeFalsy()

    // Check that it verifies correctly
    const is_same = await Crypto.verify_password("L0NG4NDH4RDP455", secured_password)
    expect(is_same).toBeTruthy()
    const is_different = await Crypto.verify_password("5KR1P7K1DD13Z", secured_password)
    expect(is_different).toBeFalsy()
  })

  test("should generate valid secure password that verifies (callback)", (done) => {
    // Check that it's 97
    Crypto.secure_password("L0NG4NDH4RDP455", (err: any, secured_password: string | undefined) => {
      if (!secured_password) {
        throw new Error("NULL_SECURE_PASSWORD")
      }
      expect(err).toBeFalsy()
      expect(secured_password).toHaveLength(97)

      Crypto.secure_password("5KR1P7K1DD13Z", (err: any, another_secured_password?: string): any => {
        expect(err).toBeFalsy()
        expect(another_secured_password === secured_password).toBeFalsy()

        Crypto.verify_password("L0NG4NDH4RDP455", secured_password, (err: any, is_same?: boolean): any => {
          expect(err).toBeFalsy()
          expect(is_same).toBeTruthy()

          Crypto.verify_password("5KR1P7K1DD13Z", secured_password, (err: any, is_different?: boolean) => {
            expect(err).toBeFalsy()
            expect(is_different).toBeFalsy()
            done()
          })
        })
      })
    })
  })

  test("should encrypt and decrypt text (await/async & callback)", async () => {
    const text = "How to paint endless paintings 101: [todo: the rest]"
    const encrypted_text = await Crypto.encrypt_data(text)
    expect(encrypted_text).toHaveProperty("encrypted_data")
    expect(encrypted_text).toHaveProperty("password")
    expect(encrypted_text.password).toHaveLength(113)
    const decrypted_text = await Crypto.decrypt_data(encrypted_text.encrypted_data, encrypted_text.password)
    expect(decrypted_text).toEqual(text)
  })

  test("should encrypt and decrypt json (await/async & callback)", async () => {
    const json = { foo: "bar " }
    const encrypted_json = await Crypto.encrypt_data(json)
    expect(encrypted_json).toHaveProperty("encrypted_data")
    expect(encrypted_json).toHaveProperty("password")
    expect(encrypted_json.password).toHaveLength(113)
    const decrypted_json = await Crypto.decrypt_data(encrypted_json.encrypted_data, encrypted_json.password)
    expect(decrypted_json).toEqual(json)
  })

  test("should encrypt and decrypt integers and floats (await/async & callback)", async () => {
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
