import { execSync } from 'child_process'
type QueueItem = {
  prompt: string
  resolve: (value: string) => void
}
const queue: QueueItem[] = []

const MAX_NEW_TOKENS = 100

const process = async (item: QueueItem) => {
  const sanitized = item.prompt.replaceAll("\"", "\\\"")
  const res = execSync(
    `python main.py --prompt "${sanitized}" --max_new_tokens ${MAX_NEW_TOKENS}`,
    {encoding: 'utf-8'}
  )
  item.resolve(res.toString())
  queue.shift()
  if (queue.length > 0) {
    process(queue[0])
  }
}

const generate = (prompt: string) => {
  return new Promise((resolve) => {
    queue.push({prompt, resolve})
    if (queue.length === 1) {
      process(queue[0])
    }
  })
}

export default generate