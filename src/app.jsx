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
    { team: 'team1', label: 'STATION 1', success: undefined, error: undefined },
    { team: 'team2', label: 'STATION 2', success: undefined, error: undefined },
    { team: 'team3', label: 'STATION 3', success: undefined, error: undefined },
    { team: 'team4', label: 'STATION 4', success: undefined, error: undefined },
    { team: 'team5', label: 'STATION 5', success: undefined, error: undefined },
    { team: 'team6', label: 'STATION 6', success: undefined, error: undefined },
    { team: 'team7', label: 'STATION 7', success: undefined, error: undefined },
    { team: 'team8', label: 'STATION 8', success: undefined, error: undefined },
    { team: 'team9', label: 'STATION 9', success: undefined, error: undefined },
    { team: 'team10', label: 'STATION 10', success: undefined, error: undefined },
  ],
  errorsWithoutTeam: []
}

APP.model = {
  API_HIT: (state, data) => {
    console.log('HIT', data, state)
    const teams = state.teams
    const { team, type, success, error } = data.data[0]
    const newTeams = teams.map(t => t.team == team ? { team, type, success, error } : t)

    return { ...state, teams: newTeams }
  }
}

APP.intent = ({ DOM, SOCKET }) => {

  return {
    API_HIT: SOCKET.select('apiCall')
  }
}

export default APP