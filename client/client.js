import {Tournament} from './models/tournament.js';

const startButtonEl = document.getElementById('start');
const teamsPerMatchEl = document.getElementById('teamsPerMatch');
const numberOfTeamsEl = document.getElementById('numberOfTeams');
const teamsEl = document.getElementById('teams');
const winnerEl = document.getElementById('winner');

// Recursively runs tournament rounds until winner is determined
function runRound (tournament){
  tournament.runCurrentRoundMatches()
  .then(() => {
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

        runRound(tournament);
      });
    }
  });
}

startButtonEl.addEventListener('click', () => {
  teamsEl.innerHTML = '<p>Loading tournament and team details...</p>';

  const tournament = new Tournament(
    parseInt(numberOfTeamsEl.value, 10),
    parseInt(teamsPerMatchEl.value, 10),
  );

  tournament.postTournamentFetchTeamsAndMatches()
  .then(() => {
    // Render teams
    teamsEl.innerHTML = tournament.renderTeamsHtml();

    runRound(tournament);
  });
});
