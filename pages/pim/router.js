import Home from './routes/Home';
import Target from './routes/Target';
import Teams from './routes/team/Teams';
import Team from './routes/team/Team';
import TeamSettings from './routes/team/Settings';
const routes = [
  {name: 'home', path: '/', component: Home},
  {name: 'target', path: '/target', component: Target},
  {name: 'teams', path: '/teams', component: Teams},
  {name: 'team', path: '/team/:tid', component: Team},
  {name: 'teamSettings', path: '/team/:tid/settings', component: TeamSettings},
  {name: 'teamCreator', path: '/teams/creator', component: TeamSettings}
];

export default new VueRouter({
  routes
});