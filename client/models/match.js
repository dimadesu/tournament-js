export class Match {
  constructor(
    tournament,
    tournamentId,
    roundId,
    matchId,
    teamIds
  ) {
    this.tournament = tournament;// TODO: could be too much to pass the whole tournament instance
    this.tournamentId = tournamentId;
    this.roundId = roundId;
    this.matchId = matchId;
    this.teamIds = teamIds;
    this.winnerTeam = null;
    this.loserTeams = [];
  }

  fetch(){
    return fetch(
      `/match?tournamentId=${this.tournamentId}&round=${this.roundId}&match=${this.matchId}`
    )
    .then(response => response.json())
    .then(data => {
      this.score = data.score;

      return this;
    });
  }

  determineWinner(){
    const matchTeams = this.teamIds.map((teamId) => {
      return this.tournament.teams.find(team => team.teamId === teamId);
    });

    return fetch(
      `/winner?tournamentId=${this.tournamentId}&matchScore=${this.score}` +
      matchTeams.map(team => `&teamScores=${team.score}`).join('')
    )
    .then(response => response.json())
    .then((data) => {
      // Match score to team
      this.winnerTeam = matchTeams.find((team) => {
        return team.score === data.score;
      });

      this.loserTeams = matchTeams.filter(team => team.teamId !== this.winnerTeam.teamId);
      
      // TODO: implement the case when score is the same in both teams

      this.winnerTeam.matches.push(this);

      this.loserTeams.forEach(
        loserTeam => loserTeam.matches.push(this)
      );
    });
  }
}
