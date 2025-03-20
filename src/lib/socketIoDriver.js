'use strict'

import xs from 'xstream'
import { adapt } from '@cycle/run/lib/adapt'

const DEFAULT_SERVER = (window && window.WS || 'ws://localhost:8080' || window.location.origin.replace('http://', 'ws://'))
const ALLOWED_TYPES = ['join', 'emit']
const io = window.io



export default function MakeSocketIoDriver(server=DEFAULT_SERVER) {
  console.log('Socket Server:', server)
  const socket = io(server)
  window.SOCKET = socket

  socket.on('error', (err) => {
    console.log('Socket error:', err)
  })

  return function socketIoDriver(out$) {
    const in$ = xs.create({
      start: listener => {
        socket.onAny((event, ...data) => listener.next({ event, data }))
        socket.on('connect',    ()    => listener.next({ event: 'connect' }))
        socket.on('disconnect', ()    => listener.next({ event: 'disconnect' }))
        socket.on('error',      (err) => listener.next({ event: 'error', data: err }))
      },

      stop: () => {
        socket.close()
      }
    })

    out$.subscribe({
      next: (command) => {
        let type, data
        if (typeof command.join == 'string') {
          type = 'join'
          data = command.join
        }
        if (typeof command.type == 'string') {
          type = command.type
          data = command.data
        } else {
          type = 'emit'
          data = command
        }
        if (!ALLOWED_TYPES.includes(type)) {
          throw new Error('Unsupported Socket.io command:', type)
        }
        socket[type](data)
      },

      complete: () => {},
      error: () => {},
    })

    return {
      select: (selector) => {
        const event$ = in$.filter((emitted) => emitted.event == selector)

        return adapt(event$)
      }
    }
  }
}
