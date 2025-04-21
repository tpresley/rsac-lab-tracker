import { classes } from 'sygnal'

const PANEL = (props, state) => {
  const { team, type, success, error } = state

  const message = success ? type : (error || "waiting...")

  const panelClasses = classes("panel", {success, error})

  return (
    <div className={ panelClasses }>
      { team } : { message }
    </div>
  )
}

export default PANEL