exports.error = (err: any, meta: any) => {
  console.error(err, meta)
  throw err
}
