import { classes } from 'sygnal'

const PANEL = (props, state) => {
  const { label, type, success, error } = state

  var message
  var done = false
  if (success) {
    message = type == 'logs' ? "logs received" : "🎉  SUCCESS 🎉 "
    if (type !== "logs") {
      done = true
    }
  } else {
    if (type === 'action' && error) {
      message = error
    } else {
      message = error ? "⚠️ ERROR ⚠️" : "waiting..."
    }
  }
  // const message = success ? type : (error || "waiting...")

  const panelClasses = classes("neon-text", "neon-box", {success: done, error})

  return (
    <div className={ panelClasses }>
      <div className="label">{ label }</div>
      <div className="message">{ message }</div>
    </div>
  )
}

PANEL.model = {
  RESET: (state, data) => {
    return { ...state, type: undefined, success: undefined, error: undefined }
  }
}

PANEL.intent = ({ DOM }) => {
  const click$ = DOM.select('.neon-box').events('click')

  return {
    RESET: click$
  }
}

export default PANEL