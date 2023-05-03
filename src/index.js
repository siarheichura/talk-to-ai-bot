import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

const INITIAL_SESSION = {
  messages: []
}
// const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.use(session())

bot.command('start', async ctx => {
  ctx.session = INITIAL_SESSION
  await ctx.reply('Waiting for your text or voice message')
})

bot.on(message('voice'), async ctx => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply('Got it! Few seconds...')

    const { href } = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = ctx.message.from.id.toString()

    const oggPath = await ogg.create(href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)

    const text = await openai.transcription(mp3Path)
    await ctx.reply(`Your request: ${text}`)

    ctx.session.messages.push({ role: openai.roles.USER, content: text })
    const response = await openai.chat(ctx.session.messages)
    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content
    })
    await ctx.reply(response.content)
  } catch (err) {
    console.error('error catch: ', err)
  }
})

bot.on(message('text'), async ctx => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply('Got it! Few seconds...')

    ctx.session.messages.push({
      role: openai.roles.USER,
      content: ctx.message.text
    })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content
    })

    await ctx.reply(response.content)
  } catch (err) {
    console.error('error catch: ', err)
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
