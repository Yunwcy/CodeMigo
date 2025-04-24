import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

export default function CodePet() {
  const [name, setName] = useState('Yuan');
  const [experience, setExperience] = useState(0);
  const [lastCoding, setLastCoding] = useState(Date.now());
  const [mood, setMood] = useState('happy');
  const [streak, setStreak] = useState(0);
  const [isEnteringTime, setIsEnteringTime] = useState(false);
  const [codingMinutes, setCodingMinutes] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState(''); // 💬 對話泡泡
  const [levelUpFlash, setLevelUpFlash] = useState(false); // 🎉 等級閃光

  // ⬆️ 提高升級門檻，每 500 XP 升一級
  const level = Math.floor(experience / 500) + 1;
  const nextLevel = level * 500;
  const progress = experience % 500;
  const progressRatio = (experience % nextLevel) / nextLevel * 100;
  const intelligence = Math.min(10, Math.floor(experience / 100) + 1);
  const energy = Math.min(10, Math.floor(experience / 150) + 1);
  const happiness = mood === 'happy' ? 10 : mood === 'neutral' ? 6 : mood === 'excited' ? 10 : 3;
  

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const saveName = () => {
    setIsEditingName(false);
    ipcRenderer.invoke('update-coding-data', {
      experience,
      lastCodingTime,
      name
    });
  };

  useEffect(() => {
    const updateMood = () => {
      const hours = (Date.now() - lastCoding) / (1000 * 60 * 60);
      if (hours < 2 && streak >= 3) setMood('excited');
      else if (hours < 12) setMood('happy');
      else if (hours < 24) setMood('neutral');
      else if (hours < 48) setMood('sad');
      else setMood('depressed');
    };
    ipcRenderer.invoke('get-coding-data').then((data) => {
      setExperience(data.experience);
      setLastCoding(data.lastCodingTime);
    });
    updateMood();
    const timer = setInterval(() => {
      updateMood();
      updateBubble();
    }, 60000);
    updateBubble();
    return () => clearInterval(timer);
  }, [lastCoding, streak, mood]);

  const updateBubble = () => {
    switch (mood) {
      case 'happy': setBubbleMessage('今天也要加油喔！'); break;
      case 'excited': setBubbleMessage('太棒了！連續輸入中！'); break;
      case 'neutral': setBubbleMessage('你在嗎？'); break;
      case 'sad': setBubbleMessage('我好孤單⋯'); break;
      case 'depressed': setBubbleMessage('嗚嗚⋯好久沒看到你了⋯'); break;
      default: setBubbleMessage('嗨～');
    }
  };

  const recordCodingTime = () => {
    const minutes = parseInt(codingMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      setFeedbackMessage('Please enter a valid number of minutes');
      return;
    }
    const hoursSinceLast = (Date.now() - lastCoding) / (1000 * 60 * 60);
    if (hoursSinceLast < 2) setStreak(streak + 1);
    else setStreak(1);
    const newExperience = experience + minutes;
    const leveledUp = Math.floor(newExperience / 500) > Math.floor(experience / 500);
    setExperience(newExperience);
    setLastCoding(Date.now());
    setMood('happy');
    setIsEnteringTime(false);
    setCodingMinutes('');
    if (leveledUp) {
      setLevelUpFlash(true); // 🎉 顯示閃光
      setTimeout(() => setLevelUpFlash(false), 1500);
    }
    setFeedbackMessage(
      leveledUp ? `${name} leveled up to level ${Math.floor(newExperience / 500) + 1}!` : `${name} gained ${minutes} XP!`
    );
    setTimeout(() => setFeedbackMessage(''), 3000);
    ipcRenderer.invoke('update-coding-data', {
      experience: newExperience,
      lastCodingTime: Date.now()
    });
  };

  const getPetExpression = () => {
    // ⬆️ 更多階段性的表情演化
    if (level > 30 && mood === 'excited') return '(≧◡≦) ♡';
    if (level > 25 && mood === 'excited') return '(๑˃ᴗ˂)ﻭ';
    if (level > 20 && mood === 'excited') return '(ฅ^•ﻌ•^ฅ)♡';
    if (level > 15 && mood === 'excited') return '٩(◕‿◕｡)۶';
    if (level > 10 && mood === 'excited') return '(*≧▽≦)';
    switch (mood) {
      case 'excited': return '＼(≧▽≦)／';
      case 'happy': return '(^‿^)';
      case 'neutral': return '(•‿•)';
      case 'sad': return '(╥﹏╥)';
      case 'depressed': return '(×_×)';
      default: return '(•‿•)';
    }
  };

  const getSpecialAbilities = () => {
    const abilities = [];
    if (level >= 3) abilities.push('Code Suggestion');
    if (level >= 5) abilities.push('Bug Detection');
    if (level >= 7) abilities.push('Refactoring Helper');
    if (level >= 10) abilities.push('AI Pair Programming');
    if (level >= 15) abilities.push('Memory Debugger');
    if (level >= 20) abilities.push('Dream Coder Mode');
    if (level >= 25) abilities.push('Code Muse');
    if (level >= 30) abilities.push('Ultimate Companion');
    return abilities;
  };

  const getMoodBackground = () => {
    switch (mood) {
      case 'excited': return 'rgba(224, 247, 250, 0.3)';
      case 'happy': return 'rgba(230, 255, 237, 0.3)';
      case 'neutral': return 'rgba(249, 249, 249, 0.3)';
      case 'sad': return 'rgba(255, 245, 245, 0.3)';
      case 'depressed': return 'rgba(224, 224, 224, 0.3)';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  };

  return (
    <div className={`codepet-container ${levelUpFlash ? 'flash' : ''}`} style={{ backgroundColor: getMoodBackground()}}>
      <div className="codepet-header">
        <h2>
          {isEditingName ? (
            <input
              value={name}
              onChange={handleNameChange}
              onBlur={saveName}
              autoFocus
              style={{ fontSize: '1.2rem', padding: '0.25rem', borderRadius: '4px', border: '1px solid #ccc' }}
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
                style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                (click to rename)
              </span>
            </>
          )}
        </h2>
        <div className="level-badge">Level {level}</div>
      </div>

      {/* 💬 對話泡泡 */}
      {bubbleMessage && (
        <div style={{ textAlign: 'center', fontStyle: 'italic', color: '#555', marginBottom: '0.5rem' }}>
          “{bubbleMessage}”
        </div>
      )}

      <div style={{ fontSize: '2rem', textAlign: 'center', margin: '1rem 0', animation: 'bounce 2s infinite' }}>
        {getPetExpression()}
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progressRatio}%`, background: 'linear-gradient(to right,rgb(133, 182, 243), #3b82f6)' }} />
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
