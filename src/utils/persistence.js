export const persistenceManager = {
  async saveData(key, data, db) {
    try {
      if (db && db[key]) {
        await db[key].clear()
        await db[key].bulkPut(data)
      }
      
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`✅ Data persisted for ${key}: ${data.length} items`)
    } catch (error) {
      console.error(`❌ Failed to persist ${key}:`, error)
      localStorage.setItem(key, JSON.stringify(data))
    }
  },

  async loadData(key, db) {
    try {
      let data = []
      
      if (db && db[key]) {
        data = await db[key].toArray()
      }
      
      if (data.length === 0) {
        const localData = localStorage.getItem(key)
        if (localData) {
          data = JSON.parse(localData)
          if (data.length > 0 && db && db[key]) {
            await db[key].bulkPut(data)
          }
        }
      } else {
        localStorage.setItem(key, JSON.stringify(data))
      }
      
      console.log(`✅ Loaded ${key}: ${data.length} items`)
      return data
    } catch (error) {
      console.error(`❌ Failed to load ${key}:`, error)
      return []
    }
  }
}