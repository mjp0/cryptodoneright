module.exports = {
  transform: {
    "^.+\\.jsx?$": "./node_modules/babel-jest",
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ["/dist/", "/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  "globals": {
    "ts-jest": {
      "babelConfig": true
    }
  }
};