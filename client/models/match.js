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
      const winnerTeams = matchTeams.filter((team) => {
        return team.score === data.score;
      });
      
      // In the event of a tie, the team with the lowest ID wins
      if (winnerTeams.length === 1) {
        this.winnerTeam = winnerTeams[0];
      } else if (winnerTeams.length > 0) {
        this.winnerTeam = winnerTeams.reduce((prevTeam, team) => {
          if (!prevTeam) {
            return team;
          } else {
            if (prevTeam.teamId < team.teamId) {
              return prevTeam;
            } else {
              return team;
            }
          }
        });
      }

      this.loserTeams = matchTeams.filter(team => team.teamId !== this.winnerTeam.teamId);

      this.winnerTeam.matches.push(this);

      this.loserTeams.forEach(
        loserTeam => loserTeam.matches.push(this)
      );
    });
  }
}
