import {Tournament} from './models/tournament.js';

const startButtonEl = document.getElementById('start');
const teamsPerMatchEl = document.getElementById('teamsPerMatch');
const numberOfTeamsEl = document.getElementById('numberOfTeams');
const teamsEl = document.getElementById('teams');
const winnerEl = document.getElementById('winner');

startButtonEl.addEventListener('click', () => {
  const tournament = new Tournament(
    parseInt(numberOfTeamsEl.value, 10),
    parseInt(teamsPerMatchEl.value, 10),
  );

  function runRound (){
    tournament.runCurrentRoundMatches()
    .then(() => {
      teamsEl.innerHTML = tournament.renderTeamsHtml();
      
      // Tournament winner determined
      if (tournament.matches[tournament.currentRound].length === 1) {
        winnerEl.textContent = tournament.matches[tournament.currentRound][0].winnerTeam.name;
      } else {
        // Next round
        tournament.createNextMatches().then(() => {
        
          tournament.currentRound++;
          
          runRound();

        });
      }
    });
  }

  tournament.fetch()
  .then(() => {
    // Render teams
    teamsEl.innerHTML = tournament.renderTeamsHtml();

    runRound();
  });
});
