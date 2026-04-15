import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage?: string;
  updatedAt: any;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

const ChatPage = () => {
  const { profile } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", profile.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatRoom)));
      setLoading(false);
    });
    return unsub;
  }, [profile]);

  useEffect(() => {
    if (!activeRoom) return;
    const q = query(
      collection(db, "chats", activeRoom.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
    });
    return unsub;
  }, [activeRoom]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeRoom || !profile) return;
    await addDoc(collection(db, "chats", activeRoom.id, "messages"), {
      senderId: profile.uid,
      text: newMsg.trim(),
      timestamp: serverTimestamp(),
    });
    setNewMsg("");
  };

  const getOtherName = (room: ChatRoom) => {
    if (!profile) return "User";
    const otherId = room.participants.find((p) => p !== profile.uid);
    return room.participantNames?.[otherId || ""] || "User";
  };

  if (activeRoom) {
    return (
      <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-5rem)]">
        {/* Chat Header */}
        <div className="glass-card px-4 py-3 flex items-center gap-3 border-b border-border/50">
          <button onClick={() => setActiveRoom(null)}>
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="h-9 w-9 rounded-full gradient-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
            {getOtherName(activeRoom)[0]}
          </div>
          <span className="font-semibold text-foreground">{getOtherName(activeRoom)}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-10">
              No messages yet. Say hello! 👋
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === profile?.uid;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Input */}
        <div className="glass-card p-3 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="h-11 rounded-xl bg-muted/50 border-0"
            />
            <button
              onClick={sendMessage}
              className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shrink-0"
            >
              <Send className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Messages</h1>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="h-12 w-12 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No conversations yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start chatting when you connect with someone</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <motion.button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-full gradient-accent flex items-center justify-center text-primary-foreground font-bold">
                {getOtherName(room)[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{getOtherName(room)}</p>
                <p className="text-sm text-muted-foreground truncate">{room.lastMessage || "No messages"}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
