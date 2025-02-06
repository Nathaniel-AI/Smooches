import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { Send } from "lucide-react";

interface Message {
  userId: number;
  username: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

interface ChatSidebarProps {
  streamId: number;
  userId: number;
  username: string;
}

export function ChatSidebar({ streamId, userId, username }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', streamId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data]);
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [streamId]);

  const sendMessage = () => {
    if (!message.trim() || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      streamId,
      userId,
      username,
      content: message.trim()
    }));

    setMessage("");
  };

  return (
    <div className="w-80 border-l border-border bg-card/50 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Live Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <ChatMessage key={i} {...msg} />
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <form 
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
