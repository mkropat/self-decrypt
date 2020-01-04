window.sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

const iterations = 10 * 1000;

const encryptToCode = (password, plaintext) => getDecryptionCode(encrypt(password, plaintext));
export { encryptToCode }

const encrypt = (password, plaintext) => {
  const iv = sjcl.random.randomWords(128/32);
  const salt = sjcl.random.randomWords(256/32);
  const key = sjcl.misc.pbkdf2(password, salt, iterations, 256);

  const aes = new sjcl.cipher.aes(key);
  const encrypted = sjcl.mode.cbc.encrypt(aes, sjcl.codec.utf8String.toBits(plaintext), iv);
  const cipherText = sjcl.codec.base64.fromBits(
    sjcl.bitArray.concat(sjcl.bitArray.concat(salt, iv), encrypted));

  return cipherText;
};

const getDecryptionCode = (cipherText) => `function Decrypt($Password, $CipherText) {
  $encrypted = [Convert]::FromBase64String($CipherText)

  $pbkdf = New-Object Security.Cryptography.Rfc2898DeriveBytes @(
    [Text.Encoding]::UTF8.GetBytes($Password.Trim()),
    $encrypted[0..31],
    ${iterations},
    [Security.Cryptography.HashAlgorithmName]::SHA256)
  $aes = New-Object Security.Cryptography.AesCryptoServiceProvider
  $aes.IV = $encrypted[32..47]
  $aes.Key = $pbkdf.GetBytes(256/8)

  Write-Host ([Text.Encoding]::UTF8.GetString(
    $aes.CreateDecryptor().TransformFinalBlock($encrypted, 48, $encrypted.Length - 48)))
}

Decrypt (Read-Host "Password") @'
${splitByChunks(cipherText).join('\n')}
'@
`;

const splitByChunks = (str, n=64) => {
  const result = [];
  for (let i = 0; i < str.length; i += n) {
    result.push(str.substr(i, n));
  }
  return result;
};
