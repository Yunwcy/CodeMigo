import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');


export default function CodePet() {
  const [name, setName] = useState('Yuan');
  const [experience, setExperience] = useState(0);
  const [lastCoding, setLastCoding] = useState(Date.now());
  const [mood, setMood] = useState('happy');
  const [isEnteringTime, setIsEnteringTime] = useState(false);
  const [codingMinutes, setCodingMinutes] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const level = Math.floor(experience / 100) + 1;
  const nextLevel = level * 100;
  const progress = experience % 100;
  const intelligence = Math.min(10, Math.floor(experience / 50) + 1);
  const energy = Math.min(10, Math.floor(experience / 70) + 1);
  const happiness = mood === 'happy' ? 10 : mood === 'neutral' ? 6 : 3;

  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  
  const saveName = () => {
    setIsEditingName(false);
  
    // ⬇️ 若要儲存進 electron-store（可選）
    ipcRenderer.invoke('update-coding-data', {
      experience,
      lastCodingTime,
      name
    });
  };
  

  useEffect(() => {
    const updateMood = () => {
      const hours = (Date.now() - lastCoding) / (1000 * 60 * 60);
      if (hours > 24) setMood('sad');
      else if (hours > 12) setMood('neutral');
      else setMood('happy');
    };
    ipcRenderer.invoke('get-coding-data').then((data) => {
      setExperience(data.experience);
      setLastCoding(data.lastCodingTime);
    });
    updateMood();
    const timer = setInterval(updateMood, 60000);
    return () => clearInterval(timer);
  }, [lastCoding]);

  const recordCodingTime = () => {
    const minutes = parseInt(codingMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      setFeedbackMessage('Please enter a valid number of minutes');
      return;
    }
    const newExperience = experience + minutes;
    setExperience(newExperience);
    setLastCoding(Date.now());
    setMood('happy');
    setIsEnteringTime(false);
    setCodingMinutes('');
    setFeedbackMessage(
      Math.floor(newExperience / 100) > Math.floor(experience / 100)
        ? `${name} leveled up to level ${Math.floor(newExperience / 100) + 1}!`
        : `${name} gained ${minutes} XP!`
    );
    setTimeout(() => setFeedbackMessage(''), 3000);
    ipcRenderer.invoke('update-coding-data', {
      experience: newExperience,
      lastCodingTime: Date.now()
    });
  };

  const changeName = () => {
    const newName = prompt('Enter a new name for your pet:', name);
    if (newName && newName.trim() !== '') {
      setName(newName.trim());
    }
  };
  

  const getPetExpression = () => {
    switch (mood) {
      case 'happy':
        return '(^‿^)';
      case 'neutral':
        return '(•‿•)';
      case 'sad':
        return '(⌣̩̩́_⌣̩̩̀)';
      default:
        return '(•‿•)';
    }
  };

  const getSpecialAbilities = () => {
    const abilities = [];
    if (level >= 3) abilities.push('Code Suggestion');
    if (level >= 5) abilities.push('Bug Detection');
    if (level >= 7) abilities.push('Refactoring Helper');
    if (level >= 10) abilities.push('AI Pair Programming');
    return abilities;
  };

  return (
    <div className="codepet-container">
      <div className="codepet-header">
        <h2> 
          {isEditingName ? (
            <input
              value={name}
              onChange={handleNameChange}
              onBlur={saveName}
              autoFocus
              style={{
                fontSize: '1.2rem',
                padding: '0.25rem',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          ) : (
            <>
              <span
                onClick={() => setIsEditingName(true)}
                style={{ fontWeight: 'bold', cursor: 'pointer' }}
                title="Click to rename your pet"
              >
                {name}
              </span>
              <span
                onClick={() => setIsEditingName(true)}
                title="Click to rename your pet"
                style={{
                  fontSize: '0.8rem',
                  color: '#666',
                  marginLeft: '0.5rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                (click to rename)
              </span>
            </>
          )}
        </h2>


        <div className="level-badge">Level {level}</div>
      </div>

      <div style={{ fontSize: '2rem', textAlign: 'center', margin: '1rem 0' }}>
        {getPetExpression()}
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        {experience} / {nextLevel} XP
      </div>

      <div className="stat-grid">
        <div className="stat-block stat-intelligence">
          <div>🧠<br />Intelligence</div>
          <strong>{intelligence}/10</strong>
        </div>
        <div className="stat-block stat-energy">
          <div>🔋<br />Energy</div>
          <strong>{energy}/10</strong>
        </div>
        <div className="stat-block stat-happiness">
          <div>❤️<br />Happiness</div>
          <strong>{happiness}/10</strong>
        </div>
      </div>


      {getSpecialAbilities().length > 0 && (
        <div>
          <h4 style={{ marginTop: '1rem' }}>Special Abilities:</h4>
          <ul>
            {getSpecialAbilities().map((a) => <li key={a}>⭐ {a}</li>)}
          </ul>
        </div>
      )}

      <div className="codepet-buttons">
        {!isEnteringTime ? (
          <button className="btn-log" onClick={() => setIsEnteringTime(true)}>Log Coding Session</button>
        ) : (
          <>
            <input
              type="number"
              value={codingMinutes}
              onChange={(e) => setCodingMinutes(e.target.value)}
              placeholder="Minutes coded"
            />
            <button className="btn-log" onClick={recordCodingTime}>Log</button>
            <button className="btn-cancel" onClick={() => { setIsEnteringTime(false); setCodingMinutes(''); }}>Cancel</button>
          </>
        )}
      </div>

      {feedbackMessage && (
        <div style={{ marginTop: '0.5rem', textAlign: 'center', color: 'green' }}>
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
