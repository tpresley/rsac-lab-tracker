import { Collection, ABORT, xs } from 'sygnal'
import Panel from './panel'


const APP = (_props, state) => {

  return (
    <div className="main">
      <collection of={ Panel } from="teams" className="panels"/>
    </div>
  )
}

APP.initialState = {
  teams: [
    { team: 'team1', success: undefined, error: undefined },
    { team: 'team2', success: undefined, error: undefined },
    { team: 'team3', success: undefined, error: undefined },
    { team: 'team4', success: undefined, error: undefined },
    { team: 'team5', success: undefined, error: undefined },
    { team: 'team6', success: undefined, error: undefined },
    { team: 'team7', success: undefined, error: undefined },
    { team: 'team8', success: undefined, error: undefined },
    { team: 'team9', success: undefined, error: undefined },
    { team: 'team10', success: undefined, error: undefined },
  ],
  errorsWithoutTeam: []
}

APP.model = {
  API_HIT: (state, data) => {
    console.log('HIT', data, state)
    const teams = state.teams
    const { team, success, error } = data.data[0]
    const newTeams = teams.map(t => t.team == team ? { team, success, error } : t)

    return { ...state, teams: newTeams }
  }
}

APP.intent = ({ DOM, SOCKET }) => {

  return {
    API_HIT: SOCKET.select('apiCall')
  }
}

export default APP