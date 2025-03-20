import { classes } from 'sygnal'

const PANEL = (props, state) => {
  const { team, success, error } = state

  const message = success ? "Success" : (error || "waiting...")

  const panelClasses = classes("panel", {success, error})

  return (
    <div className={ panelClasses }>
      { team } : { message }
    </div>
  )
}

export default PANEL