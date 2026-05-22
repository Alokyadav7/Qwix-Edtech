import { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import { Send, MessageSquare, User, Clock, Check, CheckCheck } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Messages() {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const loadRooms = async () => {
    try {
      const response = await fetch("/api/chat/rooms").then(res => res.json()).catch(() => ({}));
      if (response.data) {
        setRooms(response.data);
      } else {
        // Fallback mock rooms
        setRooms([
          { _id: "room1", name: "Google Recruiter", lastMessage: "Let's schedule a call.", unreadCount: 1 },
          { _id: "room2", name: "Innovators Hackathon Group", lastMessage: "Arjun: Send project code.", unreadCount: 0 }
        ]);
      }
    } catch {
      // handled above
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (!socket || !activeRoomId) return;

    // Join room
    socket.emit("join-room", { roomId: activeRoomId });

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user-typing", (data) => {
      if (data.roomId === activeRoomId && data.userId !== user?._id) {
        setTyping(true);
      }
    });

    socket.on("user-stop-typing", (data) => {
      if (data.roomId === activeRoomId) {
        setTyping(false);
      }
    });

    // Fetch historical messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/rooms/${activeRoomId}/messages`).then(res => res.json()).catch(() => ({}));
        if (response.data) {
          setMessages(response.data);
        } else {
          setMessages([
            { _id: "m1", senderId: "recruiter", senderName: "Google Recruiter", body: "Hello! We reviewed your profile matching score.", createdAt: new Date(Date.now() - 3600000) },
            { _id: "m2", senderId: user?._id ?? "user", senderName: user?.name ?? "Me", body: "Hi there! I am excited to learn more about the role.", createdAt: new Date(Date.now() - 1800000) }
          ]);
        }
      } catch {
        // Handled
      }
    };
    fetchMessages();

    return () => {
      socket.emit("leave-room", { roomId: activeRoomId });
      socket.off("receive-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [activeRoomId, socket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !activeRoomId) return;

    const newMessage = {
      roomId: activeRoomId,
      senderId: user?._id ?? "user",
      senderName: user?.name ?? "Me",
      body: inputText,
      createdAt: new Date()
    };

    socket.emit("send-message", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    socket.emit("stop-typing", { roomId: activeRoomId });
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket || !activeRoomId) return;

    if (e.target.value.length > 0) {
      socket.emit("typing", { roomId: activeRoomId });
    } else {
      socket.emit("stop-typing", { roomId: activeRoomId });
    }
  };

  const activeRoom = rooms.find((r) => r._id === activeRoomId);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-[calc(100vh-160px)]">
        
        {/* Left Side: Room list (4 columns) */}
        <Card hoverable={false} className="lg:col-span-4 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-navy-800 pb-2 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-electric-400" /> Conversational Channels
          </h3>

          <div className="flex flex-col gap-2">
            {rooms.map((room) => {
              const isActive = room._id === activeRoomId;
              return (
                <div
                  key={room._id}
                  onClick={() => setActiveRoomId(room._id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "border-electric-400 bg-electric-500/5"
                      : "border-electric-500/10 bg-navy-950/40 hover:border-electric-400/25"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-xs truncate max-w-[150px]">{room.name}</span>
                    {room.unreadCount > 0 && (
                      <span className="h-4 w-4 bg-electric-500 text-[10px] font-bold text-navy-950 rounded-full flex items-center justify-center">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate mt-1">{room.lastMessage}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Side: Message stream (8 columns) */}
        <Card hoverable={false} className="lg:col-span-8 flex flex-col justify-between overflow-hidden relative">
          {activeRoomId ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-navy-800 bg-navy-950 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-electric-500/10 border border-electric-500/20 text-electric-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {activeRoom?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-xs leading-none">{activeRoom?.name}</h4>
                  <span className="text-[10px] text-gray-500 mt-1 block">Active recruiting channel</span>
                </div>
              </div>

              {/* Message pane */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-navy-950/20">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === (user?._id ?? "user");
                  return (
                    <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[70%] p-3.5 rounded-xl text-xs leading-relaxed ${
                          isMe
                            ? "bg-electric-500 text-white rounded-tr-none"
                            : "bg-navy-800 text-gray-100 rounded-tl-none border border-electric-500/10"
                        }`}
                      >
                        <p>{msg.body}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-500">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck className="h-3 w-3 text-electric-400" />}
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="text-[10px] text-gray-500 italic animate-pulse">
                    Recruiter is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-navy-800 bg-navy-950 flex gap-2">
                <input
                  type="text"
                  placeholder="Type message..."
                  value={inputText}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 bg-navy-900 border border-electric-500/15 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-electric-400"
                />
                <Button type="submit" icon={Send} size="sm">Send</Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-gray-500 text-xs">
              <MessageSquare className="h-10 w-10 text-navy-800 mb-2" />
              Select a conversational channel to start messaging recruiters or teammates.
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
