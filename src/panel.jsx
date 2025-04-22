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
    message = error ? "⚠️ ERROR ⚠️" : "waiting..."
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

export default PANEL