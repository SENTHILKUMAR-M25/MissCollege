const bcrypt = require('bcryptjs')

async function test() {
  const ver = require('./node_modules/bcryptjs/package.json').version
  console.log('bcryptjs version:', ver)

  // Test 1: await hash
  try {
    const h = await bcrypt.hash('12345678', 10)
    const ok = await bcrypt.compare('12345678', h)
    console.log('Test1 await hash+compare:', ok, '| hash:', h.slice(0,20))
  } catch(e) { console.log('Test1 ERROR:', e.message) }

  // Test 2: hashSync
  try {
    const h = bcrypt.hashSync('12345678', 10)
    const ok = bcrypt.compareSync('12345678', h)
    console.log('Test2 sync hash+compare:', ok, '| hash:', h.slice(0,20))
  } catch(e) { console.log('Test2 ERROR:', e.message) }

  // Test 3: callback
  try {
    await new Promise((resolve) => {
      bcrypt.hash('12345678', 10, (err, h) => {
        if (err) { console.log('Test3 ERROR:', err.message); resolve(null); return }
        bcrypt.compare('12345678', h, (err2, ok) => {
          console.log('Test3 callback hash+compare:', ok, '| hash:', h.slice(0,20))
          resolve(null)
        })
      })
    })
  } catch(e) { console.log('Test3 ERROR:', e.message) }
}

test().catch(console.error)
