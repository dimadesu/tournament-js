import {Team} from './team.js';
import {Match} from './match.js';

export class Tournament {
  constructor(numberOfTeams, teamsPerMatch, options) {
    this.numberOfTeams = numberOfTeams;
    this.teamsPerMatch = teamsPerMatch;
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
    this.currentMatches = [];
    this.nextMatches = [];
    this.teams = [];

    this.currentRound = 0;
  }

  fetch(){
    return fetch(
      '/tournament',
      {
        method: 'post',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `numberOfTeams=${this.numberOfTeams}&teamsPerMatch=${this.teamsPerMatch}`,
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

      return Promise.all(
          teamIds.map((teamId)=> {
            return new Team(this.tournamentId, teamId).fetch();
          })
        )
        .then((teams) => {
          this.teams = teams;

          return this._fetchFirstRoundMatches()
            .then((matches) => {
              this.currentMatches = matches;
            });
        });
    });
  }

  _fetchFirstRoundMatches(){
    const matches = this.firstRoundMatchUps.map(match => {
      return {
        matchId: match.match,
        teamIds: match.teamIds,
      };
    });

    return this._fetchMatches(matches);
  }

  // matchesArray expected format:
  /*
  [
    {
      matchId: 0,
      teamIds: [0,1]
    },
    {
      matchId: 1,
      teamIds: [2,3]
    },
  ]
  */
  _fetchMatches(matchesArray){
    return Promise.all(
      matchesArray.map((match) => {
        return new Match(
          this,
          this.tournamentId,
          0,// round id
          match.matchId,
          match.teamIds
        )
        .fetch();
      })
    );
  }

  renderTeamsHtml(){
    return this.teams
      .map(team => `<p>${team.name} - ${this._renderTeamMatches(team)}</p>`)
      .join('');
  }

  _renderTeamMatches(team) {
    
    const matchResultsAsBooleans = team.matches.map(match => {
      return Team._utilDidTeamWinMatch(
        team,
        match
      );
    });
    
    return matchResultsAsBooleans.map((isWin) => {
      return isWin ? '■' : '□';
    }).join(' ');
  }

  runCurrentMatches(){
    return Promise.all(
      this.currentMatches.map((match) => {
        return match.determineWinner();
      })
    );
  }
}
