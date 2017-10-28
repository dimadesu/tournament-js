import {Tournament} from './models/tournament.js';

const startButtonEl = document.getElementById('start');
const teamsPerMatchEl = document.getElementById('teamsPerMatch');
const numberOfTeamsEl = document.getElementById('numberOfTeams');
const teamsEl = document.getElementById('teams');
const winnerEl = document.getElementById('winner');

// Recursively runs tournament rounds until winner is determined
function runTournamentRound (tournament){
  tournament.runCurrentRoundMatches().then(() => {
    // Render current round results
    teamsEl.innerHTML = tournament.renderTeamsHtml();
    
    // Tournament winner determined
    if (tournament.matches[tournament.currentRound].length === 1) {
      winnerEl.textContent = tournament.matches[tournament.currentRound][0].winnerTeam.name;
    // Next round exists
    } else {
      // Create and run next round
      tournament.createNextMatches().then(() => {
        tournament.currentRound++;

        runTournamentRound(tournament);
      });
    }
  });
}

startButtonEl.addEventListener('click', function createAndRunTournament () {
  const tournament = new Tournament(
    parseInt(numberOfTeamsEl.value, 10),
    parseInt(teamsPerMatchEl.value, 10),
  );

  teamsEl.innerHTML = '<p>Loading tournament and team details...</p>';
  winnerEl.textContent = '';// Reset winner on tournament start, makes sense starting 2nd run

  tournament.postTournamentFetchTeamsAndMatches()
  .then(() => {
    // Render teams
    teamsEl.innerHTML = tournament.renderTeamsHtml();

    runTournamentRound(tournament);
  });
});
