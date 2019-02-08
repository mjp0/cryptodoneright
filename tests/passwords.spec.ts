import Crypto from "../src/"
describe("Passwords", () => {
  test("should generate valid secure password that verifies (await/async)", async () => {
    const secured_password = await Crypto.secure_password("L0NG4NDH4RDP455")
    expect(secured_password).toHaveLength(256)

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
    // Check that it's 256
    Crypto.secure_password("L0NG4NDH4RDP455", (err: any, secured_password: string | undefined) => {
      if (!secured_password) {
        throw new Error("NULL_SECURE_PASSWORD")
      }
      expect(err).toBeFalsy()
      expect(secured_password).toHaveLength(256)

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
})
