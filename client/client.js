import {Tournament} from './models/tournament.js';

const teamsPerMatchEl = document.getElementById('teamsPerMatch');
const numberOfTeamsEl = document.getElementById('numberOfTeams');

document.getElementById('start').addEventListener('click', function createAndRunTournament () {
  new Tournament(
    parseInt(numberOfTeamsEl.value, 10),
    parseInt(teamsPerMatchEl.value, 10),
  );
});
