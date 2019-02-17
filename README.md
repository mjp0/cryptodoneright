```javascript
/*
        
 ██████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗ 
██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗
██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║
██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║
╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝
 ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝ 

██████╗  ██████╗ ███╗   ██╗███████╗
██╔══██╗██╔═══██╗████╗  ██║██╔════╝
██║  ██║██║   ██║██╔██╗ ██║█████╗
██║  ██║██║   ██║██║╚██╗██║██╔══╝
██████╔╝╚██████╔╝██║ ╚████║███████╗
╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝

██████╗ ██╗ ██████╗ ██╗  ██╗████████╗
██╔══██╗██║██╔════╝ ██║  ██║╚══██╔══╝
██████╔╝██║██║  ███╗███████║   ██║
██╔══██╗██║██║   ██║██╔══██║   ██║
██║  ██║██║╚██████╔╝██║  ██║   ██║
╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝
                                                   
Javascript Convenience Library For Crypto Best Practices

*/
```
> This library gives you ready-to-go best practice crypto as one-liner functions

[![license](https://img.shields.io/badge/license-apache--2.0-brightgreen.svg)](LICENSE) [![license](https://img.shields.io/badge/lang-typescript-brightgreen.svg)](http://typescriptland.com) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fmachianists%2Fcryptodoneright.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fmachianists%2Fcryptodoneright?ref=badge_shield) [![web-machian](https://img.shields.io/badge/web-machian.com-blue.svg)](https://machian.com) [![twitter-machianists](https://img.shields.io/badge/twitter-@machianists-blue.svg)](https://twitter.com/machianists)

CryptoDoneRight is a convenience API built on top of audited and secure cryptographic implementations like sodium (https://download.libsodium.org/doc/). We do all the necessary steps behind the scenes for everyday app tasks like hashing passwords correctly or encrypting sensitive data for storing.

## FEATURES
- Secures, signs and verifies passwords and all types of data
- Works with NodeJS streams out-of-the-box
- Seamless encryption and decryption flow: `string|number|object|buffer in > string|number|object|buffer out`
- No configuration required, everything is preset to best practices
- Everything is a one-liner
- Supports both pure javascript and native modules

This library will change accordingly if the security industry best practices change. We also try to offer tools for migrating old data up to the new standards so upgrading old data would be just a click away - by making your job easier to migrate your system to have better security measures, we protect our own data as your users better.

### COMMON SUPPORTED CRYPTO TASKS

- [x] Handling passwords securely (Argon2)
- [x] Syncronous encrypting and decrypting data (XChaCha20-Poly1305)
- [x] Supports encrypting and decrypting streams (XChaCha20-Poly1305)
- [x] Generating public & private keys (ed25519)
- [x] Signing and verifying data with public and private keys (ed25519)
- [x] Generating random numbers and strings (supports native randomness generators)
  
#### Need more functionality?
- Need something more? Tell me at https://twitter.com/markopolojarvi.

## GETTING STARTED
Before doing anything else get CryptoDoneRight from NPM: 

```shell
npm i -g cryptodoneright
```

Then it's time to get going. First, import cryptodoneright

```
import cdr from 'cryptodoneright'
```

Or if you need to run it in the browser, grab /dist/cryptodoneright.min.js and add that on your page. All function will be under `cdr` global variable.

## HANDLING PASSWORDS SECURELY
All password hashing is done with Argon2, the password-hashing function that won the Password Hashing Competition (https://password-hashing.net/)

### HASH ALL THE PASSWORDS
Send the password you got as a plain text to `secure_password` function and you will get back a hash as a string. Hash string can be stored into a database as-is and it will be used to verify the password later.

```javascript
const password = 'endl3ss'
const hashed_password = await cdr.secure_password(password)

console.log(hashed_password) // -> "$argon2id$v=19$m=65536,..."
```

Now you can store `hashed_password` in the database safely

#### Callbacks supported also
CDR uses await/async style as the primary but alternatively, you can use callbacks (works with all other methods). The last argument is always callback `function(error, data)`.

```javascript
cdr.secure_password(received_password, (err, hashed_password) => {
  console.log(hashed_password) // -> "$argon2id$v=19$m=65536,..."
})
```

### VERIFY GIVEN PASSWORD
Check if user's password is correct by giving `verify_password` function the password you got from the user as plain text and the hash you got from your database. Note that this method works only with hashes generated with `secure_password` and libsodium.js library. 

```javascript
var received_password = 'endl3ss'
var password_in_database = "$argon2id$v=19$m=65536,..."

var is_verified = await cdr.verify_password(received_password, password_in_database)

console.log(is_verified) // -> true
```

That's it - one line for hashing, one line for verifying.


## SECURING DATA. PROPERLY.

Encrypting data properly safely can be a hassle because to get it right, you need to know which algorithm is still safe, what's the optimum key length, whether quantum computing will affect the algorithm and a bunch of other "small things" that can bite you. CryptoDoneRight uses the latest secure and mobile-friendly encryption algorithm XChaCha20-Poly1305 which gives you the same security guarantees as industry standard AES256 and as a bonus is much more performant, especially on the phones, and fixes a bunch of theoretical attack vectors in AES256.

#### All Javascript variable types supported
For developers to use crypto properly everywhere, we need to make it as easy as possible. For this reason CDR supports encrypting and decrypting without having to somehow modify the data structure or format.

### ENCRYPT ALL THE DATA
Encrypting something simple like text shouldn't be more than a one-liner, so that's how easy it is with CryptoDoneRight. You don't even need to worry about creating a secure enough decryption password, that's done for you too.

> In case you are interested what happens behind the scenes: All data is encrypted with XChaCha20-Poly1305 where ChaCha20 encrypts your data and Poly1305 computes an authentication tag that will be used to verify in decryption phase that your encrypted data hasn't been tampered with. The reason why current recommendation is ChaCha20 instead of AES boils down to better performance with mobile devices without any provable decrease in security.


```javascript
var private_text = "My credit card PIN is 3117"
var encrypted_text = await cdr.encrypt_data(private_text)

console.log(encrypted_text)
// -> { encrypted_data: Uint8Array, password: "432fadvxasdf..."}
```

Don't save the password with the encrypted_data, it kinda defeats the point...

**Works with JSON/objects directly**
```javascript
var json = { wip_texts: [ encrypted_text ] }
var encrypted_json = await cdr.encrypt_data(json)

console.log(encrypted_json)
// -> { encrypted_data: Uint8Array, password: "432fadvxasdf..."}
```

**Works with integers, floats and booleans as well**
```javascript
var data = 4 || 4.00000002 || true
var encrypted_data = await cdr.encrypt_data(data)

console.log(encrypted_data)
// -> { encrypted_data: Uint8Array, password: "432fadvxasdf..."}
```

**And any sort of data that can be converted with `Buffer.from()`**
```javascript
var fs = require('fs')
var photo = fs.readFileSync(`${__dirname}/tests/photo.jpg`)
var encrypted_photo = await cdr.encrypt_data(photo)

console.log(encrypted_photo)
// -> { encrypted_data: Uint8Array, password: "432fadvxasdf..."}
```

**You can use your own key if you want**
```javascript
// key has to be 64 characters long
var key = await cdr.generate_random_string(64)
var private_text = "My credit card PIN is 3117"
var encrypted_text = await cdr.encrypt_data_with_key(key, private_text)

console.log(encrypted_text)
// -> { encrypted_data: Uint8Array, password: "432fadvxasdf..."}
```

**Works with streams**

CDR supports encrypting streams out-of-the-box but process is a bit more involved than a one-liner. Please note that since streams are buffers, stream encryption works only with buffers.

```javascript
// key has to be 64 characters long
var key = await cdr.generate_random_string(64)
var readable_stream = Stream.Readable()

// This will get called once encryption key and randomizer value (nonce) are ready - save these somewhere safe
function credentials_callback(err, credentials) {
  creds = credentials
  // -> { key, nonce }
})
const stream_encryptor = cdr.encrypt_stream_with_key(key, credentials_callback) // no await available

readable_stream.pipe(stream_encryptor).pipe(fs.createWriteStream("encrypted_output.bin"))
readable_stream.push(Buffer.from("hello"))
readable_stream.push(null) // tells the stream that this is the end
```

### DECRYPTING
Decrypting is very straight-forward. Data will be automatically converted into same format as it were when you encrypted it.
```javascript
var decrypted_data = await cdr.decrypt_data(encrypted_data, password)

console.log(decrypted_data) // in the same format as it was before encrypting
```

**Works with streams**

CDR supports decrypting streams out-of-the-box but process is a bit more involved than a one-liner. Please note that since streams are buffers, stream decryption returns buffers so you have to convert your data back to the right format.

```javascript
var readable_stream = fs.createReadStream("encrypted_output.bin")

// remember credentials you got when encrypting? you need them here.
const stream_decryptor = cdr.decrypt_stream_with_key(key, nonce) // no await available

readable_stream.pipe(stream_decryptor).pipe(convert_to_text).pipe(fs.createWriteStream("decrypted_output.txt"))

```

## SIGNING AND VERIFYING DATA
Before you can sign anything, you need a key pair where one key is used to proving it's you and the other one you give to other so they can verify it's you. In crypto world the keys are named public and private. Public key can be given to anyone freely. Private key gives you the power to sign messages and those who have your public key can verify the message is from you and that the message hasn't been modified by anybody while in transit.

### GENERATE A NEW KEYS

> CDR uses ed25519 asymmetric signing algorithm that's also being used in bitcoin for creating transactions. One could say it's been battle-tested quite hard.

```javascript
var keypair = await cdr.generate_keys()

console.log(keypair)
// -> { type: "ed25519", private: "4fDag43...", public: "52gaAbD..." }
```

**Remember: only share your `public` key and never `private` key.**

### SIGNING DATA
Now that we have our keypair we can sign data. Just like data encryption functions, signing also works with all javascript data types out-of-the-box.

```javascript
var text = "super secret message"
var signature = await cdr.sign_data(text, private_key)

console.log(signature)
// -> "ga4FDSAk99j..."
```

CDR will return only the signature and leave it up to you whether you want to encrypt your data before sending. The only thing you need to remember is that when you want to verify some data with a public key, the data has to be in the same format as it was when it was signed. So if a Buffer was signed, you can't verify UInt8Array, you need it as Buffer.


### VERIFYING DATA
Verifying whether the data is exactly the same as what the sender sent.

```javascript
var received_text = "super secret message"
var received_signature = "ga4FDSAk99j..."
var sender_public_key = "52gaAbD..."

var is_valid = await cdr.verify_data(received_text, received_signature, sender_public_key)
// -> true
```

## GENERATING RANDOM STRINGS
Sometimes you just need a random string for a password or something. CDR gives you a one-liner that delivers completely random stuff derived from the most random source possible (varies in different platforms).

```javascript
var len = 32 // how long of a string you need
var random_string = await cdr.generate_random_string(len)
// -> "3g34Adf23123fastjk234JdsaVsdfaKT"
```

## LOOKING FOR MORE CUSTOMIZATION?
CryptoDoneRight is meant to be so simple that you don't need to worry about messing up. This means that all configuration that can be pre-set based on best practices will be pre-set and not configurable by the user.

If you want something more you should jump straight to libsodium that gives you the foundational tools: https://github.com/jedisct1/libsodium.js

## LICENSE
Apache 2.0