import { unlink } from 'fs/promises'

export async function removeFile(path) {
  try {
    await unlink(path)
  } catch (err) {
    console.error('Error while removing file', err.message)
  }
}
