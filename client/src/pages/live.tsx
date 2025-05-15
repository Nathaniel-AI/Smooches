import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function LivePage() {
  const [isConnected, setIsConnected] = useState(false);
  
  // Simulate connection status change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">🔴 Live Smooches</h2>
      <Card className="overflow-hidden mb-4">
        <iframe
          className="w-full h-[400px] bg-black"
          src="https://www.youtube.com/embed/live_stream?channel=UCQHs9oJ1-PT5A1W27g1xLtw" 
          title="Live Stream"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </Card>
      
      <div className="mb-4 flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
        <span className="text-sm text-gray-600">
          {isConnected ? 'Connected' : 'Connecting to stream...'}
        </span>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        Live stream is powered via YouTube. Join the chat to interact with other viewers.
      </p>
      
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-2">Upcoming Live Events</h3>
        <ul className="space-y-3 text-left">
          <li className="border-b pb-2">
            <p className="font-semibold">Friday Night DJ Session</p>
            <p className="text-sm text-gray-600">Friday, 8:00 PM</p>
          </li>
          <li className="border-b pb-2">
            <p className="font-semibold">Cooking with Chef Mike</p>
            <p className="text-sm text-gray-600">Saturday, 6:30 PM</p>
          </li>
          <li>
            <p className="font-semibold">Monday Motivation Talk</p>
            <p className="text-sm text-gray-600">Monday, 9:00 AM</p>
          </li>
        </ul>
      </div>
    </div>
  );
}