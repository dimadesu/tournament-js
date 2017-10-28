import {Tournament} from './models/tournament.js';

const startButtonEl = document.getElementById('start');
const teamsPerMatchEl = document.getElementById('teamsPerMatch');
const numberOfTeamsEl = document.getElementById('numberOfTeams');
const teamsEl = document.getElementById('teams');

startButtonEl.addEventListener('click', () => {
  const tournament = new Tournament(
    parseInt(numberOfTeamsEl.value, 10),
    parseInt(teamsPerMatchEl.value, 10),
  );

  tournament.fetch().then(() => {
    teamsEl.innerHTML = tournament.renderTeamsHtml();

    tournament.runCurrentMatches()
      .then(() => {
        teamsEl.innerHTML = tournament.renderTeamsHtml();

        // tournament.runCurrentMatches()
        // .then(() => {
        //   teamsEl.innerHTML = tournament.renderTeamsHtml();
        // });
      });
  });
});
