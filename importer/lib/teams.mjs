// Team dictionary used to guess team / league / country from an album title.
// Order matters: more specific aliases first. Extend freely; unknown teams fall back to "Other leagues".
export const TEAMS = [
  // National teams
  [['spain'], 'Spain', 'National teams', 'Spain'],
  [['argentina'], 'Argentina', 'National teams', 'Argentina'],
  [['brazil', 'brasil'], 'Brazil', 'National teams', 'Brazil'],
  [['portugal'], 'Portugal', 'National teams', 'Portugal'],
  [['germany'], 'Germany', 'National teams', 'Germany'],
  [['england'], 'England', 'National teams', 'England'],
  [['france'], 'France', 'National teams', 'France'],
  [['italy'], 'Italy', 'National teams', 'Italy'],
  [['netherlands', 'holland'], 'Netherlands', 'National teams', 'Netherlands'],
  [['belgium'], 'Belgium', 'National teams', 'Belgium'],
  [['croatia'], 'Croatia', 'National teams', 'Croatia'],
  [['mexico'], 'Mexico', 'National teams', 'Mexico'],
  [['japan'], 'Japan', 'National teams', 'Japan'],
  [['usa', 'united states'], 'USA', 'National teams', 'USA'],
  [['hungary'], 'Hungary', 'National teams', 'Hungary'],
  [['wales'], 'Wales', 'National teams', 'Wales'],
  [['scotland'], 'Scotland', 'National teams', 'Scotland'],
  [['colombia'], 'Colombia', 'National teams', 'Colombia'],
  [['uruguay'], 'Uruguay', 'National teams', 'Uruguay'],
  [['morocco'], 'Morocco', 'National teams', 'Morocco'],
  // Liga Portugal
  [['sporting'], 'Sporting CP', 'Liga Portugal', 'Portugal'],
  [['porto'], 'FC Porto', 'Liga Portugal', 'Portugal'],
  [['benfica'], 'SL Benfica', 'Liga Portugal', 'Portugal'],
  [['vitoria sc', 'vitória sc', 'guimaraes', 'guimarães'], 'Vitória SC', 'Liga Portugal', 'Portugal'],
  [['braga'], 'SC Braga', 'Liga Portugal', 'Portugal'],
  // La Liga
  [['real madrid'], 'Real Madrid', 'La Liga', 'Spain'],
  [['atletico', 'atlético'], 'Atlético Madrid', 'La Liga', 'Spain'],
  [['barcelona', 'barca', 'barça'], 'FC Barcelona', 'La Liga', 'Spain'],
  [['betis'], 'Real Betis', 'La Liga', 'Spain'],
  [['sevilla'], 'Sevilla', 'La Liga', 'Spain'],
  [['valencia'], 'Valencia', 'La Liga', 'Spain'],
  [['villarreal'], 'Villarreal', 'La Liga', 'Spain'],
  [['athletic'], 'Athletic Club', 'La Liga', 'Spain'],
  [['celta'], 'Celta de Vigo', 'La Liga', 'Spain'],
  [['granada'], 'Granada', 'La Liga', 'Spain'],
  [['elche'], 'Elche', 'La Liga', 'Spain'],
  // Premier League
  [['manchester city', 'man city'], 'Manchester City', 'Premier League', 'England'],
  [['manchester united', 'man utd', 'man united', 'm-u'], 'Manchester United', 'Premier League', 'England'],
  [['liverpool', 'lfc'], 'Liverpool', 'Premier League', 'England'],
  [['arsenal'], 'Arsenal', 'Premier League', 'England'],
  [['chelsea'], 'Chelsea', 'Premier League', 'England'],
  [['tottenham', 'spurs'], 'Tottenham Hotspur', 'Premier League', 'England'],
  [['newcastle'], 'Newcastle United', 'Premier League', 'England'],
  [['aston villa'], 'Aston Villa', 'Premier League', 'England'],
  [['middlesbrough'], 'Middlesbrough', 'Premier League', 'England'],
  [['watford'], 'Watford', 'Other leagues', 'England'],
  // Serie A
  [['inter miami'], 'Inter Miami', 'Other leagues', 'USA'],
  [['inter milan', 'inter'], 'Inter', 'Serie A', 'Italy'],
  [['ac milan', 'milan'], 'AC Milan', 'Serie A', 'Italy'],
  [['juventus'], 'Juventus', 'Serie A', 'Italy'],
  [['napoli'], 'Napoli', 'Serie A', 'Italy'],
  [['roma'], 'AS Roma', 'Serie A', 'Italy'],
  [['lazio'], 'Lazio', 'Serie A', 'Italy'],
  // Bundesliga
  [['bayern'], 'Bayern Munich', 'Bundesliga', 'Germany'],
  [['dortmund'], 'Borussia Dortmund', 'Bundesliga', 'Germany'],
  [['leverkusen'], 'Bayer Leverkusen', 'Bundesliga', 'Germany'],
  [['köln', 'koln', 'cologne'], 'FC Köln', 'Bundesliga', 'Germany'],
  // Ligue 1
  [['psg', 'paris saint', 'paris sg'], 'Paris Saint-Germain', 'Ligue 1', 'France'],
  [['marseille'], 'Olympique de Marseille', 'Ligue 1', 'France'],
  [['lyon'], 'Olympique Lyonnais', 'Ligue 1', 'France'],
  [['lille'], 'Lille', 'Ligue 1', 'France'],
  [['lens'], 'RC Lens', 'Ligue 1', 'France'],
  // Brasileiro
  [['flamengo'], 'Flamengo', 'Brasileiro Série A', 'Brazil'],
  [['vasco'], 'Vasco da Gama', 'Brasileiro Série A', 'Brazil'],
  [['internacional'], 'Internacional', 'Brasileiro Série A', 'Brazil'],
  [['cruzeiro'], 'Cruzeiro', 'Brasileiro Série A', 'Brazil'],
  [['bahia'], 'Bahia', 'Brasileiro Série A', 'Brazil'],
  [['palmeiras'], 'Palmeiras', 'Brasileiro Série A', 'Brazil'],
  [['corinthians'], 'Corinthians', 'Brasileiro Série A', 'Brazil'],
  [['santos'], 'Santos', 'Brasileiro Série A', 'Brazil'],
  [['fluminense'], 'Fluminense', 'Brasileiro Série A', 'Brazil'],
  // Other leagues
  [['ajax'], 'Ajax', 'Other leagues', 'Netherlands'],
  [['psv'], 'PSV', 'Other leagues', 'Netherlands'],
  [['celtic'], 'Celtic', 'Other leagues', 'Scotland'],
  [['rangers'], 'Rangers', 'Other leagues', 'Scotland'],
  [['trabzonspor'], 'Trabzonspor', 'Other leagues', 'Turkey'],
  [['galatasaray'], 'Galatasaray', 'Other leagues', 'Turkey'],
  [['fenerbahce', 'fenerbahçe'], 'Fenerbahçe', 'Other leagues', 'Turkey'],
  [['bodø', 'bodo', 'glimt'], 'Bodø/Glimt', 'Other leagues', 'Norway'],
  [['nacional'], 'Nacional', 'Other leagues', 'Uruguay'],
  [['colo colo', 'colo-colo'], 'Colo-Colo', 'Other leagues', 'Chile'],
  [['boca'], 'Boca Juniors', 'Other leagues', 'Argentina'],
  [['river plate'], 'River Plate', 'Other leagues', 'Argentina'],
  [['al nassr'], 'Al Nassr', 'Other leagues', 'Saudi Arabia'],
];

// Club names that contain a country name must win over the country: check clubs first.
const isNational = t => t[2] === 'National teams';
const ORDERED = [...TEAMS.filter(t => !isNational(t)), ...TEAMS.filter(isNational)];

export function findTeam(title) {
  const t = ' ' + title.toLowerCase().replace(/\s+/g, ' ') + ' ';
  for (const [aliases, team, league, country] of ORDERED) {
    if (aliases.some(a => new RegExp(`(^|[^a-z])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(t))) return { team, league, country };
  }
  return null;
}
