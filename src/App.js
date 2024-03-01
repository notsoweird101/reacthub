import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

const App = () => {
  const [topBulletPlayers, setTopBulletPlayers] = useState([]);
  const [topBlitzPlayers, setTopBlitzPlayers] = useState([]);
  const [searchPlayer, setSearchPlayer] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
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

    const interval = setInterval(fetchTopPlayers, 60000); 

    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (event) => {
    setSearchPlayer(event.target.value);
  };

  const fetchPlayerInfo = async () => {
    try {
      const response = await axios.get(`https://lichess.org/api/user/${searchPlayer}`);
      setPlayerInfo(response.data);
      setError(null);
      fetchLastGame(searchPlayer);
    } catch (error) {
      setError('Error fetching player information');
    }
  };

  const fetchLastGame = async (username) => {
    try {
      const response = await axios.get(`https://lichess.org/api/games/user/${username}`, {
        params: {
          max: 1
        }
      });
      setPlayerGames(response.data.games || []); 
    } catch (error) {
      setError('Error fetching player games data');
    }
  };

  return (
    <div className="container">
      <h1>Top 10 Bullet Players</h1>
      {error && <p className="error">{error}</p>}
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
      
      <div className="search">
        <input 
          type="text" 
          placeholder="Search player by ID" 
          value={searchPlayer} 
          onChange={handleSearchChange} 
        />
        <button onClick={fetchPlayerInfo}>Search</button>
      </div>
      
      {playerInfo && (
        <div>
          <h2>Player Information</h2>
          <p>Username: {playerInfo.username}</p>
          <p>Country: {playerInfo.profile?.country}</p>
          <p>Title: {playerInfo.title}</p>
          <p>Online: {playerInfo.online}</p>
        </div>
      )}

      <h2>Last Game for Searched Player</h2>
      {Array.isArray(playerGames) && playerGames.length > 0 ? (
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
