import './style/main.css'

import { run } from 'sygnal'
import makeSocketIoDriver from './lib/socketIoDriver'
import App from './app'

const WS = `ws://${ window.location.host }`
const DRIVERS = {
  SOCKET: makeSocketIoDriver(WS)
}

const { hmr } = run(App, DRIVERS)

if (import.meta.hot) {
  import.meta.hot.accept('./app', hmr)
}
