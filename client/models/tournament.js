export class Tournament {
  constructor(numberOfTeams, teamsPerMatch, options) {
    this.teams = [];
    this.matches = [];
    // Format
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
    this.url = '/tournament';
    this.tournamentId = null;

    fetch(
      this.url,
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
      this.firstRoundMatchUps = data.matchUps;
    });
  }
}
