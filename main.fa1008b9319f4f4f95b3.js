/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://self-decrypt/./src/index.css?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _openssl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./openssl */ \"./src/openssl.js\");\n/* harmony import */ var _powershell__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./powershell */ \"./src/powershell.js\");\n/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.css */ \"./src/index.css\");\n\n\n\n\nconst inputElements = [encryptButton, passwordInput, plaintextInput]\n\nconst init = () => {\n  passwordInput.value = getRandomHexString(256)\n\n  tabify(document.querySelector('.tabs'))\n\n  document.querySelector('form').addEventListener('submit', (evt) => {\n    evt.preventDefault()\n\n    const { password, plaintext } = parseInput()\n    if (!password) {\n      return\n    }\n\n    results.style.visibility = 'hidden'\n    const reenableElements = disableElements(inputElements)\n\n    setTimeout(() => {\n      try {\n        powershellResults.querySelector('.code').value = (0,_powershell__WEBPACK_IMPORTED_MODULE_1__.encryptToCode)(password, plaintext)\n        opensslResults.querySelector('.code').value = (0,_openssl__WEBPACK_IMPORTED_MODULE_0__.encryptToCode)(password, plaintext)\n      } finally {\n        reenableElements()\n        results.style.visibility = 'visible'\n      }\n    })\n  })\n}\n\nconst disableElements = (elements) => {\n  const initialState = elements.map(x => x.disabled)\n  for (const e of elements) {\n    e.disabled = true\n  }\n\n  return () => {\n    for (const [i, e] of elements.entries()) {\n      e.disabled = initialState[i]\n    }\n  }\n}\n\nconst getRandomHexString = numBits => sjcl.codec.hex.fromBits(sjcl.random.randomWords(numBits/32))\n\nconst hashHrefToId = el => new URL(el.href).hash.slice(1)\n\nconst normalizePlaintext = plaintext => plaintext.endsWith('\\n') ?\n  plaintext :\n  `${plaintext}\\n`\n\nconst parseInput = () => ({\n  password: passwordInput.value.trim(),\n  plaintext: normalizePlaintext(plaintextInput.value),\n})\n\nconst tabify = (tabList) => {\n  const links = Array.from(tabList.querySelectorAll('li a'))\n  if (links.length === 0) {\n    throw new Error('Expected to find links to sections')\n  }\n\n  const sectionById = {}\n  for (const id of links.map(hashHrefToId)) {\n    const el = document.getElementById(id)\n    sectionById[id] = {\n      display: el.style.display,\n      el,\n    }\n  }\n  const sections = links.map(hashHrefToId).map(id => document.getElementById(id))\n\n  for (const section of Object.values(sectionById).slice(1)) {\n    section.el.style.display = 'none'\n  }\n\n  for (const link of links) {\n    link.addEventListener('click', (evt) => {\n      evt.preventDefault()\n\n      const targetId = hashHrefToId(evt.target)\n      const targetSection = sectionById[targetId]\n      targetSection.el.style.display = targetSection.display\n\n      const otherTabs = Object.entries(sectionById).filter(([id, _]) => id !== targetId)\n      for (const [id, section] of otherTabs) {\n        section.el.style.display = 'none'\n      }\n    })\n  }\n}\n\ninit()\n\n\n//# sourceURL=webpack://self-decrypt/./src/index.js?");

/***/ }),

/***/ "./src/openssl.js":
/*!************************!*\
  !*** ./src/openssl.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"encryptToCode\": () => (/* binding */ encryptToCode)\n/* harmony export */ });\nwindow.sjcl.beware['CBC mode is dangerous because it doesn\\'t protect message integrity.']()\n\nconst iterations = 10 * 1000\n\nconst encryptToCode = (password, plaintext) => getDecryptionCode(encrypt(password, plaintext))\n\n\nconst encrypt = (password, plaintext) => {\n  const salt = sjcl.random.randomWords(64/32)\n  const derived = sjcl.misc.pbkdf2(password, salt, iterations, 256 + 128)\n  const key = sjcl.bitArray.bitSlice(derived, 0, 256)\n  const iv = sjcl.bitArray.bitSlice(derived, 256, 256 + 128)\n\n  const aes = new sjcl.cipher.aes(key)\n  const encrypted = sjcl.mode.cbc.encrypt(aes, sjcl.codec.utf8String.toBits(plaintext), iv)\n  const magic = sjcl.codec.utf8String.toBits('Salted__')\n  const cipherText = sjcl.codec.base64.fromBits(sjcl.bitArray.concat(sjcl.bitArray.concat(magic, salt), encrypted))\n\n  return cipherText\n}\n\nconst getDecryptionCode = cipherText =>\n  `openssl enc -d -aes-256-cbc -md sha256 -iter ${iterations} -a -in - <<EOF\n${splitByChunks(cipherText).join('\\n')}\nEOF`\n\nconst splitByChunks = (str, n=64) => {\n  const result = []\n  for (let i = 0; i < str.length; i += n) {\n    result.push(str.substr(i, n))\n  }\n  return result\n}\n\n\n//# sourceURL=webpack://self-decrypt/./src/openssl.js?");

/***/ }),

/***/ "./src/powershell.js":
/*!***************************!*\
  !*** ./src/powershell.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"encryptToCode\": () => (/* binding */ encryptToCode)\n/* harmony export */ });\nwindow.sjcl.beware['CBC mode is dangerous because it doesn\\'t protect message integrity.']()\n\nconst iterations = 10 * 1000\n\nconst encryptToCode = (password, plaintext) => getDecryptionCode(encrypt(password, plaintext))\n\n\nconst encrypt = (password, plaintext) => {\n  const iv = sjcl.random.randomWords(128/32)\n  const salt = sjcl.random.randomWords(256/32)\n  const key = sjcl.misc.pbkdf2(password, salt, iterations, 256)\n\n  const aes = new sjcl.cipher.aes(key)\n  const encrypted = sjcl.mode.cbc.encrypt(aes, sjcl.codec.utf8String.toBits(plaintext), iv)\n  const cipherText = sjcl.codec.base64.fromBits(sjcl.bitArray.concat(sjcl.bitArray.concat(salt, iv), encrypted))\n\n  return cipherText\n}\n\nconst getDecryptionCode = cipherText => `function Decrypt($Password, $CipherText) {\n  $encrypted = [Convert]::FromBase64String($CipherText)\n\n  $pbkdf = New-Object Security.Cryptography.Rfc2898DeriveBytes @(\n    [Text.Encoding]::UTF8.GetBytes($Password.Trim()),\n    $encrypted[0..31],\n    ${iterations},\n    [Security.Cryptography.HashAlgorithmName]::SHA256)\n  $aes = New-Object Security.Cryptography.AesCryptoServiceProvider\n  $aes.IV = $encrypted[32..47]\n  $aes.Key = $pbkdf.GetBytes(256/8)\n\n  Write-Host ([Text.Encoding]::UTF8.GetString(\n    $aes.CreateDecryptor().TransformFinalBlock($encrypted, 48, $encrypted.Length - 48)))\n}\n\nDecrypt (Read-Host \"Password\") @'\n${splitByChunks(cipherText).join('\\n')}\n'@\n`\n\nconst splitByChunks = (str, n=64) => {\n  const result = []\n  for (let i = 0; i < str.length; i += n) {\n    result.push(str.substr(i, n))\n  }\n  return result\n}\n\n\n//# sourceURL=webpack://self-decrypt/./src/powershell.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;