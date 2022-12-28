import { encryptToCode as encryptToOpenssl } from './openssl'
import { encryptToCode as encryptToPowershell } from './powershell'
import style from './index.css'

const inputElements = [encryptButton, passwordInput, plaintextInput]

const init = () => {
  passwordInput.value = getRandomHexString(256)

  tabify(document.querySelector('.tabs'))

  document.querySelector('form').addEventListener('submit', (evt) => {
    evt.preventDefault()

    const { password, plaintext } = parseInput()
    if (!password) {
      return
    }

    results.style.visibility = 'hidden'
    const reenableElements = disableElements(inputElements)

    setTimeout(() => {
      try {
        powershellResults.querySelector('.code').value = encryptToPowershell(password, plaintext)
        opensslResults.querySelector('.code').value = encryptToOpenssl(password, plaintext)
      } finally {
        reenableElements()
        results.style.visibility = 'visible'
      }
    })
  })
}

const disableElements = (elements) => {
  const initialState = elements.map(x => x.disabled)
  for (const e of elements) {
    e.disabled = true
  }

  return () => {
    for (const [i, e] of elements.entries()) {
      e.disabled = initialState[i]
    }
  }
}

const getRandomHexString = numBits => sjcl.codec.hex.fromBits(sjcl.random.randomWords(numBits/32))

const hashHrefToId = el => new URL(el.href).hash.slice(1)

const normalizePlaintext = plaintext => plaintext.endsWith('\n') ?
  plaintext :
  `${plaintext}\n`

const parseInput = () => ({
  password: passwordInput.value.trim(),
  plaintext: normalizePlaintext(plaintextInput.value),
})

const tabify = (tabList) => {
  const links = Array.from(tabList.querySelectorAll('li a'))
  if (links.length === 0) {
    throw new Error('Expected to find links to sections')
  }

  const sectionById = {}
  for (const id of links.map(hashHrefToId)) {
    const el = document.getElementById(id)
    sectionById[id] = {
      display: el.style.display,
      el,
    }
  }
  const sections = links.map(hashHrefToId).map(id => document.getElementById(id))

  for (const section of Object.values(sectionById).slice(1)) {
    section.el.style.display = 'none'
  }

  for (const link of links) {
    link.addEventListener('click', (evt) => {
      evt.preventDefault()

      const targetId = hashHrefToId(evt.target)
      const targetSection = sectionById[targetId]
      targetSection.el.style.display = targetSection.display

      const otherTabs = Object.entries(sectionById).filter(([id, _]) => id !== targetId)
      for (const [id, section] of otherTabs) {
        section.el.style.display = 'none'
      }
    })
  }
}

init()
