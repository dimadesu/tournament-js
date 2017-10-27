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
        });
    });
  }

  renderTeamsHtml(){
    return this.teams
      .map(team => `<p>${team.name} - ■ □</p>`)
      .join('');
  }

  runRound(){
    return this.fetchMatches().then(() => {
      this.matches.map((match) => {
        const matchTeams = match.teamIds.map((teamId) => {
          return this.teams.find(team => team.teamId === teamId);
        });

        fetch(
          `/winner?tournamentId=${this.tournamentId}&matchScore=${match.score}` +
          matchTeams.map(team => `&teamScores=${team.score}`).join('')
        )
        .then(response => response.json())
        .then((data) => {
          debugger;
          data.score;

          // Match score to team
          const winningTeam = matchTeams.find((team) => {
            return team.score === data.score;
          });

          winningTeam.matches = [true, false];

          // TODO: implement the case when score is the same in both teams
        });
      });
      this.teams
    });
  }

  fetchMatches(){
    return Promise.all(
      this.firstRoundMatchUps.map(match => {
        return new Match(
          this.tournamentId,
          0,// round id
          match.match,
          match.teamIds
        )
        .fetch();
      })
    )
    .then((matches) => {
      this.matches = matches;
    });
  }
}
