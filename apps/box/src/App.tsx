import { useState } from "react";
import { useTauriCommand, useWindowSize } from "./hooks";
import UserManager from "./UserManager";

function App() {
  const [currentView, setCurrentView] = useState<'greet' | 'users'>('users');
  const [name, setName] = useState("");
  const { data: greetMsg, loading, execute: greet } = useTauriCommand<string>("greet");
  const windowSize = useWindowSize();

  const handleGreet = () => {
    if (name.trim()) {
      greet({ name });
    }
  };

  return (
    <div className="container">
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <button 
          onClick={() => setCurrentView('greet')}
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: currentView === 'greet' ? '#007bff' : '#f8f9fa',
            color: currentView === 'greet' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          问候功能
        </button>
        <button 
          onClick={() => setCurrentView('users')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: currentView === 'users' ? '#007bff' : '#f8f9fa',
            color: currentView === 'users' ? 'white' : 'black',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          用户管理
        </button>
      </nav>

      {currentView === 'greet' ? (
        <div>
          <h1>Welcome to Tauri + React!</h1>
          
          <div className="row">
            <input
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter a name..."
              onKeyDown={(e) => e.key === 'Enter' && handleGreet()}
              style={{ 
                marginRight: '10px',
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff',
                color: '#000',
                outline: 'none'
              }}
            />
            <button 
              type="button" 
              onClick={handleGreet}
              disabled={loading || !name.trim()}
            >
              {loading ? "Greeting..." : "Greet"}
            </button>
          </div>
          
          {greetMsg && <p>{greetMsg}</p>}
          
          <p className="info">
            窗口大小: {windowSize.width} x {windowSize.height}
          </p>
        </div>
      ) : (
        <UserManager key={currentView} />
      )}
    </div>
  );
}

export default App;