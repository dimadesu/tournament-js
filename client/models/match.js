export class Match {
  constructor(
    tournamentId,
    roundId,
    matchId,
    teamIds
  ) {
    this.tournamentId = tournamentId;
    this.roundId = roundId;
    this.matchId = matchId;
    this.teamIds = teamIds;
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
}
