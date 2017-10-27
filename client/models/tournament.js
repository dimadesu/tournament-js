import {Team} from './team.js';

export class Tournament {
  constructor(numberOfTeams, teamsPerMatch, options) {
    this.tournamentId = null;
    /*
    [
      {
        match: 0,
        teamIds: [0, 1]
      },
      {
        match: 1,
        teamIds: [2, 3]
      }
    ]
    */
    this.firstRoundMatchUps = [];
    this.teams = [];

    this.currentRound = 0;

    fetch(
      '/tournament',
      {
        method: 'post',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `numberOfTeams=${numberOfTeams}&teamsPerMatch=${teamsPerMatch}`,
      }
    )
    .then(response => response.json())
    .then((data) => {
      this.tournamentId = data.tournamentId;
      this.firstRoundMatchUps = data.matchUps;

      // TODO: could be an overkill and not performant, but at least compact
      const teamIds = this.firstRoundMatchUps.reduce((teamIds, match) => {
        const nextTeamIds = [...teamIds, ...match.teamIds];

        return nextTeamIds;
      }, []);

      Promise.all(
        teamIds.map((teamId)=> {
          return new Team(this.tournamentId, teamId).fetch();
        })
      )
      .then((teams) => {
        this.teams = teams;
      });
    });
  }
}
