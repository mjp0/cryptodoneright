import Crypto from "../src/"
describe("Random", () => {
  test("should generate random strings with fixed length", async () => {
    const len_32 = await Crypto.generate_random_string(32)
    const len_64 = await Crypto.generate_random_string(64)
    expect(len_32).toHaveLength(32)
    expect(len_64).toHaveLength(64)
  })
})