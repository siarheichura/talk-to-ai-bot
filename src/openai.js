import { fileURLToPath } from 'url'
import { Configuration, OpenAIApi } from 'openai'

import config from 'config'
import { createReadStream } from 'fs'

class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system'
  }

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey
    })
    this.openai = new OpenAIApi(configuration)
  }

  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages
      })

      return response.data.choices[0].message
    } catch (err) {
      console.log('Error while gpt chatting: ', err.message)
    }
  }

  async transcription(filePath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filePath),
        'whisper-1'
      )

      return response.data.text
    } catch (err) {
      console.error('Error while transcription: ', err.message)
    }
  }
}

export const openai = new OpenAI(process.env.OPENAI_KEY)
// export const openai = new OpenAI(config.get('OPENAI_KEY'))
