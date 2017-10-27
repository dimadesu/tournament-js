export class Match {
  constructor(
    tournamentId,
    roundId,
    matchId
  ) {
    this.tournamentId = tournamentId;
    this.roundId = roundId;
    this.matchId = matchId;
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
