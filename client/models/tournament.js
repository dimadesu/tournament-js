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
    this.matches = [];
    this.teams = [];

    this.currentRound = 0;

    // UI
    this.teamsEl = document.getElementById('teams');
    this.winnerEl = document.getElementById('winner');
  }

  postTournamentFetchTeamsAndMatches(){
    this.teamsEl.innerHTML = '<p>Loading tournament and team details...</p>';
    this.winnerEl.textContent = '';// Reset winner on tournament start, makes sense starting 2nd run

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

      return Promise.all(
        [
          this._fetchTeams(),
          this._fetchFirstRoundMatches()
        ]
      ).then(() => {
        // Render teams
        this.teamsEl.innerHTML = this.renderTeamsHtml();
      });
    });
  }

  _fetchTeams() {
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
  }

  _fetchFirstRoundMatches(){
    const matchPromises = this.firstRoundMatchUps.map(match => {
      return new Match(
        this,
        this.tournamentId,
        this.currentRound,
        match.match,// matchId
        match.teamIds
      )
      .fetch();
    });

    return Promise.all(
        matchPromises
      ).then((matches) => {
        this.matches[0] = matches;
      });
  }

  renderTeamsHtml(){
    return this.teams
      .map(team => `
        <div>
          <p>
            ${team.name}<br/>
            ${this._renderTeamMatches(team)}
          </p>
        </div>
      `)
      .join('');
  }

  // Recursively runs tournament rounds until winner is determined
  runTournamentRound (){
    this._runCurrentRoundMatches().then(() => {
      // Render current round results
      this.teamsEl.innerHTML = this.renderTeamsHtml();
      
      // Tournament winner determined
      if (this.matches[this.currentRound].length === 1) {
        this.winnerEl.textContent = this.matches[this.currentRound][0].winnerTeam.name;
      // Next round exists
      } else {
        // Create and run next round
        this._createNextMatches().then(() => {
          this.currentRound++;

          this.runTournamentRound();
        });
      }
    });
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

  _runCurrentRoundMatches(){
    return Promise.all(
      this.matches[this.currentRound].map((match) => {
        return match.determineWinner();
      })
    );
  }

  _createNextMatches(){
    const nextMatchTeams = this.matches[this.currentRound].map((match) => match.winnerTeam);

    const nextMatches = [];
    let tempMatch = new Match(
      this,
      this.tournamentId,
      this.currentRound + 1,
      nextMatches.length,// match id is just index
      []// teamIds
    );

    nextMatchTeams.map((team) => {
      tempMatch.teamIds.push(team.teamId);

      if (tempMatch.teamIds.length === this.teamsPerMatch) {
        nextMatches.push(tempMatch);

        tempMatch = new Match(
          this,
          this.tournamentId,
          this.currentRound + 1,// match id is just index
          nextMatches.length,// match id is just index
          []// teamIds
        );
      }
    });

    this.matches[this.currentRound + 1] = nextMatches;

    return Promise.all(
      nextMatches.map(match => match.fetch())
    );
  }
}
