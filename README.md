```javascript
/************************************************************************
        
        @@@@@@@  @@@@@@@   @@@ @@@  @@@@@@@   @@@@@@@   @@@@@@   
        @@@@@@@@  @@@@@@@@  @@@ @@@  @@@@@@@@  @@@@@@@  @@@@@@@@  
        !@@       @@!  @@@  @@! !@@  @@!  @@@    @@!    @@!  @@@  
        !@!       !@!  @!@  !@! @!!  !@!  @!@    !@!    !@!  @!@  
        !@!       @!@!!@!    !@!@!   @!@@!@!     @!!    @!@  !@!  
        !!!       !!@!@!      @!!!   !!@!!!      !!!    !@!  !!!  
        :!!       !!: :!!     !!:    !!:         !!:    !!:  !!!  
        :!:       :!:  !:!    :!:    :!:         :!:    :!:  !:!  
        ::: :::  ::   :::     ::     ::          ::    ::::: ::  
        :: :: :   :   : :     :      :           :      : :  :   

        Javascript Convenience Library For Crypto Best Practices

************************************************************************/
```
This library gives you ready-to-go best practice crypto functions, so you don't have to worry about getting crypto right.

Crypto is a convenience API built on top of audited and secure cryptographic implementations like sodium (https://download.libsodium.org/doc/). We do all the necessary steps behind the scenes for everyday app tasks like hashing passwords correctly or encrypting sensitive data for storing.

This library will change accordingly if the security industry best practices for supported tasks change. We also try to offer tools for migrating old data up to the new standards so upgrading old data would be just a click away.

### SUPPORTED TASKS

- [x] Handling passwords securely
- [x] Encrypting and decrypting all the data
- [X] Generating public & private keypairs
- [X] Signing and verifying data
- [X] Generating random numbers and strings
  
### TASKS COMING SOON
- What do you need? Let me know at https://twitter.com/markopolojarvi.

Before doing anything else get CryptoDoneRight from NPM: 

> npm i cryptodoneright -g

Then it's time to get going. First, import cryptodoneright

`import cdr from 'cryptodoneright'`

Or if you need to run it in the browser, grab /dist/cryptodoneright.min.js and add that on your page. All function will be under `cdr` global variable. **We don't recommend browser usage until we have size-optimized version of the library, sorry.**

## HANDLING PASSWORDS SECURELY
All password hashing is done with Argon2, the password-hashing function that won the Password Hashing Competition (https://password-hashing.net/)

### HASH ALL THE PASSWORDS
We all want to store passes securely but knowing what hashing function to use and how to set it up right is a pita. Wouldn't it be nice to have a one-liner?

```javascript
var received_password = 'endl3ss'
var hashed_password = await cdr.secure_password(received_password)

console.log(hashed_password) // -> "$argon2id$v=19$m=65536,..."
```

Now you can store `hashed_password` in the database safely

Or alternatively, you can use callbacks (works with all other methods)

```javascript
cdr.secure_password(received_password, (err, hashed_password) => {
  console.log(hashed_password) // -> "$argon2id$v=19$m=65536,..."
})
```

### VERIFY GIVEN PASSWORD
How about when you want to check if user's password is correct?

```javascript
var received_password = 'endl3ss'
var password_in_database = hashed_password // let's pretend this came from db
// -> "$argon2id$v=19$m=65536,..."

var is_same = await cdr.verify_password(received_password, password_in_database)

console.log(is_same) // -> true
```

That's it - one line for hashing, one line for verifying.


## SECURING DATA... SECURELY

Encrypting data can be a hassle because to get it right, you need to know which algorithm is still safe, what's the optimum key length, how quantum computing will affect the algorithm and a bunch of other "small things" that can bite you in the end.

And on top of that, you have to deal with converting different javascript variable types around...

Wouldn't it be great if there was a one-liner just to encrypt what you want? 

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

**Works with JSON directly**
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

### DECRYPTING
Decrypting is pretty self-explanatory. Data will be automatically converted into same format as it were when you encrypted it.
```javascript
var encrypted_data = encrypted_photo.encrypted_data
var password = encrypted.password
var decrypted_photo = await cdr.decrypt_data(encrypted_data, password)

console.log(decrypted_photo)
// -> tests/photo.jpg
```

## SIGNING AND VERIFYING DATA
When it comes to the fundamentals of secure communication, being able to sign data for safe transfer and verify the data we received is pretty much right there in the top 1.

Before you can sign anything, you need a key pair where one key is for your eyes only that you use for signing and a counterpart key that you can give other people so they can verify your signature.

### GENERATE A NEW KEYPAIR

> CDR uses ed25519 asymmetric signing algorithm that's also being used in bitcoin for signing transactions. One could say it's been battle-tested quite hard.

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
var signature = await cdr.sign_data(text, keypair.private)

console.log(signature)
// -> "ga4FDSAk99j..."
```

CDR will return only the signature and leave it up to you whether you want to encrypt your data before sending. The only thing you need to remember is that the data needs to be in the same type in verification as it was when signing.


### VERIFYING DATA
Verifying whether the data is exactly as the sender intended is yet another one-liner.

```javascript
var received_text = "super secret message"
var received_signature = "ga4FDSAk99j..."
var received_public_key = "52gaAbD..."

var is_valid = await cdr.verify_data(received_text, received_signature, received_public_key)
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
MIT