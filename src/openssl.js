window.sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

const iterations = 10 * 1000;

const encryptToCode = (password, plaintext) => getDecryptionCode(encrypt(password, plaintext));
export { encryptToCode }

const encrypt = (password, plaintext) => {
  const salt = sjcl.random.randomWords(64/32);
  const derived = sjcl.misc.pbkdf2(password, salt, iterations, 256 + 128);
  const key = sjcl.bitArray.bitSlice(derived, 0, 256);
  const iv = sjcl.bitArray.bitSlice(derived, 256, 256 + 128);

  const aes = new sjcl.cipher.aes(key);
  const encrypted = sjcl.mode.cbc.encrypt(aes, sjcl.codec.utf8String.toBits(plaintext), iv);
  const magic = sjcl.codec.utf8String.toBits('Salted__');
  const cipherText = sjcl.codec.base64.fromBits(
    sjcl.bitArray.concat(sjcl.bitArray.concat(magic, salt), encrypted));

  return cipherText;
};

const getDecryptionCode = (cipherText) =>
  `openssl enc -d -aes-256-cbc -md sha256 -iter ${iterations} -a -in - <<EOF
${splitByChunks(cipherText).join('\n')}
EOF`;

const splitByChunks = (str, n=64) => {
  const result = [];
  for (let i = 0; i < str.length; i += n) {
    result.push(str.substr(i, n));
  }
  return result;
};
