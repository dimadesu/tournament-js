export class Team {
  constructor(tournamentId, teamId) {
    this.tournamentId = tournamentId;
    this.teamId = teamId;
    this.name = null;
    this.score = null;
    this.matches = [];
  }

  fetch(){
    return fetch(
      `/team?tournamentId=${this.tournamentId}&teamId=${this.teamId}`,
    )
    .then(response => response.json())
    .then(data => {
      this.name = data.name;
      this.score = data.score;

      return this;
    });
  }
  
  static _utilDidTeamWinMatch(
    team,
    match
  ){
    return match.winnerTeam.teamId === team.teamId;
  }
}
