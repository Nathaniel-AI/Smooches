// Smooches App – Frontend with Login/Logout and Live Streams (React + Tailwind + Context)

import React, { useState, createContext, useContext } from "react";

// Create context for authentication
const AuthContext = createContext<any>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  const login = (username: string) => setUser({ name: username });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// Simplified login page
function LoginPage() {
  const [name, setName] = useState("");
  const { login } = useAuth();

  return (
    <div className="p-6 max-w-sm mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Login to Smooches</h1>
      <input
        className="border p-2 rounded w-full mb-4"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="bg-pink-500 text-white px-4 py-2 rounded"
        onClick={() => login(name)}
      >
        Login
      </button>
    </div>
  );
}

// Video Feed component
function VideoFeed() {
  const videos = [
    { id: 1, user: "Kiki", url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", caption: "🔥 Morning vibes!" },
    { id: 2, user: "Lash", url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", caption: "Manifesting chaos 💅" },
    { id: 3, user: "Big Tank", url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", caption: "Late-night rants incoming." },
  ];

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Latest Videos</h2>
      <div className="space-y-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <video
              className="w-full h-[480px] object-cover"
              src={video.url}
              controls
              loop
              poster="https://placehold.co/600x400/black/white?text=Loading+Video..."
            />
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                  {video.user.charAt(0)}
                </div>
                <span className="font-bold">@{video.user}</span>
              </div>
              <p className="text-gray-600">{video.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Live Stream page
function LivePage() {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">🔴 Live Smooches</h2>
      <iframe
        className="w-full h-64 rounded border"
        src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
        title="Live Stream"
        allowFullScreen
      ></iframe>
      <p className="mt-4 text-sm text-gray-600">Live stream is powered via external service. Replace URL with your live source.</p>
    </div>
  );
}

// Home page with welcome message
function HomePage() {
  const { user, logout } = useAuth();
  
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Smooches, {user?.name} 💋</h1>
      <div className="mb-6 flex justify-center space-x-4">
        <a href="#feed" className="text-pink-600 underline">View Feed</a>
        <a href="#live" className="text-pink-600 underline">Join Live Streams</a>
      </div>
      <button
        className="bg-gray-800 text-white px-4 py-2 rounded"
        onClick={logout}
      >
        Logout
      </button>
      
      <div id="feed" className="mt-8">
        <VideoFeed />
      </div>
      
      <div id="live" className="mt-8">
        <LivePage />
      </div>
    </div>
  );
}

// Simple app without routing
function SmoochesSimpleApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shadow-md">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold">SMOOCHES</h1>
          </div>
        </header>
        
        <Content setIsLoggedIn={setIsLoggedIn} />
      </div>
    </AuthProvider>
  );
}

// Content component that handles showing login or home page
function Content({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) {
  const { user } = useAuth();
  
  React.useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user, setIsLoggedIn]);
  
  if (!user) {
    return <LoginPage />;
  }
  
  return <HomePage />;
}

export default SmoochesSimpleApp;