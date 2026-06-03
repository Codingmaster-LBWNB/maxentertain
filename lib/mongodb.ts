import { MongoClient } from 'mongodb'

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  const options = { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 }

  if (process.env.NODE_ENV === 'development') {
    const g = global as typeof global & { _mongoClientPromise?: Promise<MongoClient> }
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(uri, options).connect()
    }
    clientPromise = g._mongoClientPromise
  } else {
    clientPromise = new MongoClient(uri, options).connect()
  }

  return clientPromise
}

export async function getDb(dbName = 'maxentertain') {
  const c = await getClientPromise()
  return c.db(dbName)
}
