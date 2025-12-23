// App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [article, setArticle] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('fakeNewsHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('fakeNewsHistory', JSON.stringify(history));
    }
  }, [history]);

  // Mock AI detection function (in real app, this would call an API)
  const detectFakeNews = async (text) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock detection logic
    const keywords = {
      fake: ['urgent', 'breaking', 'shocking', 'unbelievable', 'miracle', 'secret', 'they don\'t want you to know'],
      reliable: ['according to study', 'research shows', 'official report', 'verified', 'peer-reviewed']
    };

    let fakeScore = 0;
    let reliableScore = 0;
    
    const lowerText = text.toLowerCase();
    
    keywords.fake.forEach(word => {
      if (lowerText.includes(word)) fakeScore++;
    });
    
    keywords.reliable.forEach(word => {
      if (lowerText.includes(word)) reliableScore++;
    });

    const totalScore = fakeScore + reliableScore;
    const fakePercentage = totalScore > 0 ? (fakeScore / totalScore) * 100 : 50;
    
    let status;
    let confidence;
    
    if (fakePercentage > 70) {
      status = 'FAKE';
      confidence = 'High';
    } else if (fakePercentage > 40) {
      status = 'SUSPICIOUS';
      confidence = 'Medium';
    } else {
      status = 'RELIABLE';
      confidence = 'High';
    }

    return {
      status,
      confidence,
      fakePercentage: Math.round(fakePercentage),
      reliablePercentage: Math.round(100 - fakePercentage),
      reasons: generateReasons(text, fakeScore, reliableScore),
      timestamp: new Date().toISOString()
    };
  };

  const generateReasons = (text, fakeScore, reliableScore) => {
    const reasons = [];
    
    if (fakeScore > reliableScore) {
      reasons.push('Contains sensationalist language');
      reasons.push('Missing credible sources');
      reasons.push('Uses emotional trigger words');
    } else if (reliableScore > fakeScore) {
      reasons.push('Includes references to research/studies');
      reasons.push('Uses measured language');
      reasons.push('Mentions verifiable sources');
    } else {
      reasons.push('Mixed indicators detected');
      reasons.push('Requires further verification');
    }
    
    return reasons;
  };

  const handleCheck = async () => {
    if (!article.trim()) {
      alert('Please enter an article to check');
      return;
    }

    setLoading(true);
    try {
      const detectionResult = await detectFakeNews(article);
      setResult(detectionResult);
      
      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        snippet: article.substring(0, 100) + '...',
        result: detectionResult,
        date: new Date().toLocaleString()
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep only last 10 items
    } catch (error) {
      console.error('Error detecting fake news:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setArticle('');
    setResult(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('fakeNewsHistory');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'FAKE': return '#ef4444';
      case 'SUSPICIOUS': return '#f59e0b';
      case 'RELIABLE': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📰 Fake News Detector</h1>
        <p>Check the credibility of news articles using AI analysis</p>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="input-section">
            <h2>Enter Article Text</h2>
            <div className="textarea-container">
              <textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Paste the article text here to check for fake news..."
                rows="10"
              />
              <div className="char-count">{article.length} characters</div>
            </div>
            
            <div className="button-group">
              <button 
                onClick={handleCheck} 
                disabled={loading || !article.trim()}
                className="check-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : 'Check Article'}
              </button>
              <button 
                onClick={handleClear}
                className="clear-button"
              >
                Clear
              </button>
            </div>
          </div>

          {result && (
            <div className="result-section">
              <h2>Analysis Results</h2>
              <div className="result-card">
                <div className="status-header" style={{ backgroundColor: getStatusColor(result.status) }}>
                  <h3>Status: {result.status}</h3>
                  <span className="confidence">Confidence: {result.confidence}</span>
                </div>
                
                <div className="score-container">
                  <div className="score-bar">
                    <div className="score-labels">
                      <span>Fake</span>
                      <span>Reliable</span>
                    </div>
                    <div className="bar-container">
                      <div 
                        className="fake-bar" 
                        style={{ width: `${result.fakePercentage}%` }}
                      >
                        {result.fakePercentage}%
                      </div>
                      <div 
                        className="reliable-bar" 
                        style={{ width: `${result.reliablePercentage}%` }}
                      >
                        {result.reliablePercentage}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="reasons-section">
                  <h4>Key Findings:</h4>
                  <ul>
                    {result.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="tips">
                  <h4>📝 Tips for Spotting Fake News:</h4>
                  <ul>
                    <li>Check the source credibility</li>
                    <li>Look for supporting evidence</li>
                    <li>Verify with fact-checking websites</li>
                    <li>Be wary of emotional language</li>
                    <li>Check the publication date</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="history-section">
              <div className="history-header">
                <h2>Recent Checks</h2>
                <button 
                  onClick={handleClearHistory}
                  className="clear-history-button"
                >
                  Clear History
                </button>
              </div>
              <div className="history-list">
                {history.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-snippet">{item.snippet}</div>
                    <div className="history-result">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(item.result.status) }}
                      >
                        {item.result.status}
                      </span>
                      <span className="history-date">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>
         ⚠️ Disclaimer: This tool uses AI for preliminary analysis. 
          Always verify information through multiple credible sources.
        </p>
        <p className="footer-links">
          <a href="#">How it works</a> • 
          <a href="#">Fact-checking Resources</a> • 
          <a href="#">Report Issue</a>
        </p>
      </footer>
    </div>
  );
}

export default App;