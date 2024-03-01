import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [topBulletPlayers, setTopBulletPlayers] = useState([]);
  const [topBlitzPlayers, setTopBlitzPlayers] = useState([]);
  const [searchPlayer, setSearchPlayer] = useState('');
  const [playerGames, setPlayerGames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const response = await axios.get('https://lichess.org/api/player');
        const bulletPlayers = response.data.bullet.slice(0, 10);
        const blitzPlayers = response.data.blitz.slice(0, 10);
        setTopBulletPlayers(bulletPlayers);
        setTopBlitzPlayers(blitzPlayers);
        setError(null);
      } catch (error) {
        setError('Error fetching top players data');
      }
    };

    fetchTopPlayers();

    const interval = setInterval(fetchTopPlayers, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (event) => {
    setSearchPlayer(event.target.value);
  };

  const fetchPlayerGames = async () => {
    try {
      const response = await axios.get(`https://lichess.org/api/games/user/${searchPlayer}`);
      setPlayerGames(response.data);
      setError(null);
    } catch (error) {
      setError('Error fetching player games data');
    }
  };

  return (
    <div>
      <h1>Top 10 Bullet Players</h1>
      {error && <p>{error}</p>}
      <ul>
        {topBulletPlayers.map(player => (
          <li key={player.id}>
            {player.username} - {player.perfs.bullet.rating}
          </li>
        ))}
      </ul>

      <h1>Top 10 Blitz Players</h1>
      <ul>
        {topBlitzPlayers.map(player => (
          <li key={player.id}>
            {player.username} - {player.perfs.blitz.rating}
          </li>
        ))}
      </ul>
      
      <div>
        <input 
          type="text" 
          placeholder="Search player by ID" 
          value={searchPlayer} 
          onChange={handleSearchChange} 
        />
        <button onClick={fetchPlayerGames}>Search</button>
      </div>
      
      <h2>Player Games</h2>
      {playerGames.length > 0 ? (
        <ul>
          {playerGames.map(game => (
            <li key={game.id}>
              Opponent: {game.players.black.username === searchPlayer ? game.players.white.username : game.players.black.username} | 
              Score: {game.status === 'draw' ? 'Draw' : game.winner === searchPlayer ? 'Win' : 'Loss'} | 
              Duration: {game.turns} turns
            </li>
          ))}
        </ul>
      ) : (
        <p>No games found for the specified player.</p>
      )}
    </div>
  );
};

export default App;
