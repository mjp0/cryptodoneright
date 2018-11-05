import Crypto from "../src/"
describe("Hashing", () => {
  test("should generate valid hash", async () => {
    const hashed_text1 = await Crypto.hash("foobar")
    expect(hashed_text1).toHaveLength(64)
    const hashed_text2 = await Crypto.hash("barfoo")
    expect(hashed_text2).toHaveLength(64)

    expect(hashed_text1 === hashed_text2).toBeFalsy()
  })
})
