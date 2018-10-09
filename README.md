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
This library gives you ready-to-go best practice crypto functions so you don't have to worry about getting crypto right.

Crypto is a convenience API built on top of audited and secure cryptographic implementations like sodium (https://download.libsodium.org/doc/). We do all the necessary steps behind the scenes for every day app tasks like hashing passwords correctly or encrypting sensitive data for storing.

This library will change accordingly if security industry best practices for supported tasks change. We also try to offer tools for migrating old data up to the new standards so upgrading old data would be just a click away.

### SUPPORTED TASKS

- [x] Handling passwords securely
- [x] Encrypting and decrypting all the data

### TASKS COMING SOON
- [ ] Generating random numbers and strings
- [ ] Generating public & private keypairs
- [ ] Signing and verifying data

Before doing anything else get CryptoDoneRight from NPM: 

> npm i cryptodoneright -g

Then it's time to get going. First, import cryptodoneright

`import cdr from 'cryptodoneright'`

Or if you need to run it in the browser, grab /dist/cryptodoneright.min.js and add that on your page. All function will be under `cdr` global variable.

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

Or alternatively you can use callbacks (works with all other methods)

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

Encrypting data can be a hassle because you need to know which algorithm is still safe, what's the optimum key length, and how quantum computing will affect the algorithm.

And you have to deal with converting different variable types around... 

Wouldn't it be great if there was a one-liner to just encrypt what you want? 

### ENCRYPT ALL THE DATA
Encrypting something simple like text shouldn't be more than one liner so that's how easy it is with CryptoDoneRight. You don't even need to worry about creating a secure enough decryption password, that's done for you too.

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


## LICENSE
MIT