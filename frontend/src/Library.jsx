import { useState, useEffect, useRef } from "react";
import { subscribeToMessages } from "./context/AuthContext";
import "./LibraryPage.css";

/* ---------------- DATA ---------------- */

const friends = [];

const allUsers = [
    { id: 101, name: "John Doe" },
    { id: 102, name: "Sarah K." },
    { id: 103, name: "Alex M." },
    { id: 104, name: "Lisa R." },
];

const gamesLibrary = [
    { id: 1, title: "Minecraft" },
    { id: 2, title: "Terraria" },
];

const storeGames = [
    { id: 201, title: "Elden Ring" },
    { id: 202, title: "Hades" },
    { id: 203, title: "Cyberpunk 2077" },
];

/* ---------------- COMPONENT ---------------- */

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState("library");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [searchSubmitted, setSearchSubmitted] = useState(false);
    const [sentRequests, setSentRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    /* FRIENDS STATES */
    const [addFriendMode, setAddFriendMode] = useState(false);
    const [friendQuery, setFriendQuery] = useState("");
    const [friendList, setFriendList] = useState([]);


    /* CHAT STATE */
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState({});
    const [chatInput, setChatInput] = useState("");

    /* STORE SEARCH */
    const [storeQuery, setStoreQuery] = useState("");

    const activeChatRef = useRef(null);

    useEffect(() => {
        activeChatRef.current = activeChatUser;
    }, [activeChatUser]);

    useEffect(() => {
        const unsubscribe = subscribeToMessages((msg) => {
            if (!currentUserId) return;

            const otherUserId =
                msg.sender_id === currentUserId
                    ? msg.receiver_id
                    : msg.sender_id;

            /* const active = activeChatRef.current;
 
             if (active?.user_id !== otherUserId) return;*/

            setMessages((prev) => ({
                ...prev,
                [otherUserId]: [
                    ...(prev[otherUserId] || []),
                    {
                        ...msg,
                        fromMe: msg.sender_id === currentUserId,
                    },
                ],
            }));
        });

        return unsubscribe;
    }, [currentUserId]);

    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                const res = await fetch("/api/auth/me");
                const data = await res.json();

                setCurrentUserId(data.user_id);
            } catch (err) {
                console.error(err);
            }
        }

        fetchCurrentUser();
    }, []);

    const games =
        activeTab === "library"
            ? gamesLibrary
            : storeGames.filter(g =>
                g.title.toLowerCase().includes(storeQuery.toLowerCase())
            );

    /* ---------------- FRIEND SEARCH ---------------- */

    const filteredUsers = searchResults;

    const enterPressed = (e) => e.key === "Enter";

    const sendFriendRequest = (user) => {
        setSentRequests(prev => [...prev, user.id]);
        console.log("Friend request sent to:", user.name);
    };

    const handleFriendSearchKey = async (e) => {
        if (e.key !== "Enter") return;

        try {
            const res = await fetch(`/api/friends/search?query=${friendQuery}`);
            const data = await res.json();

            setSearchResults(data);
            setSearchSubmitted(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStoreSearchKey = (e) => {
        if (enterPressed(e)) {
            console.log("Store search:", storeQuery);
        }
    };

    /* ---------------- CHAT ---------------- */

    const openChat = async (user) => {
        setActiveChatUser(user);

        try {
            const resMsg = await fetch(`/api/messages/${user.user_id}`);
            const dataMsg = await resMsg.json();
            const formatted = dataMsg.map(m => ({
                ...m,
                fromMe: m.sender_id === currentUserId
            }));

            setMessages(prev => ({
                ...prev,
                [user.user_id]: formatted
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async () => {
        const content = chatInput.trim();

        if (!content) return;

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    receiverId: activeChatUser.user_id,
                    content
                })
            });

            if (!res.ok) {
                throw new Error("Failed to send message");
            }

            const newMessage = {
                message_id: Date.now(),
                sender_id: currentUserId,
                receiver_id: activeChatUser.user_id,
                content,
                created_at: new Date().toISOString(),
                fromMe: true
            };

            setMessages(prev => ({
                ...prev,
                [activeChatUser.user_id]: [
                    ...(prev[activeChatUser.user_id] || []),
                    newMessage
                ]
            }));

            setChatInput("");
        }
        catch (err) {
            console.error(err);
        }
    };

    const goBackToFriends = () => {
        setActiveChatUser(null);
    };

    useEffect(() => {
        async function fetchFriends() {
            try {
                const res = await fetch("/api/friends");
                const data = await res.json();
                console.log(data);
                setFriendList(data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchFriends();
    }, []);

    return (
        <div className="layout">

            {/* LEFT PANEL */}
            <aside className="friends-panel">

                {/* CHAT VIEW */}
                {activeChatUser && (
                    <div className="chat-view">

                        <div className="chat-header">
                            <button onClick={goBackToFriends}>
                                ← Back
                            </button>

                            <h3>{activeChatUser.name}</h3>
                        </div>

                        <div className="chat-messages">
                            {(messages[activeChatUser.user_id] || []).map((m, i) => (
                                <div
                                    key={i}
                                    className={`msg ${m.fromMe ? "me" : ""}`}
                                >
                                    {m.content}
                                </div>
                            ))}
                        </div>

                        <div className="chat-input">
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendMessage();
                                }}
                                placeholder="Nachricht..."
                            />
                            <button onClick={sendMessage}>
                                Send
                            </button>
                        </div>
                    </div>
                )}

                {/* FRIENDS VIEW */}
                {!activeChatUser && (
                    <>
                        <div className="friends-header">
                            <h2>Freundesliste</h2>

                            <button
                                className={`add-btn ${addFriendMode ? "active" : ""}`}
                                onClick={() => {
                                    setAddFriendMode(p => !p);
                                    setSearchSubmitted(false);
                                    setFriendQuery("");
                                }}
                            >
                                +
                            </button>
                        </div>

                        {/* LIST */}
                        {!addFriendMode && (
                            <ul className="friends-list">
                                {friendList.map(f => (
                                    <li
                                        key={f.user_id}
                                        className="friend-item"
                                        onClick={() => openChat(f)}
                                    >
                                        {f.username}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* SEARCH USERS */}
                        {addFriendMode && (
                            <div className="add-friend-view">
                                <div className="friend-search-header">
                                    <button
                                        className="back-btn"
                                        onClick={() => {
                                            setAddFriendMode(false);
                                            setSearchSubmitted(false);
                                            setSearchResults([]);
                                            setFriendQuery("");
                                        }}
                                    >
                                        ← Zurück
                                    </button>
                                </div>
                                <input
                                    className="friend-search"
                                    value={friendQuery}
                                    onChange={(e) => {
                                        setFriendQuery(e.target.value);
                                        setSearchSubmitted(false);
                                    }}
                                    onKeyDown={handleFriendSearchKey}
                                    placeholder="User suchen..."
                                    autoFocus
                                />

                                <div className="search-results">

                                    {searchResults.length === 0 && (
                                        <p style={{ color: "#888" }}>
                                            Keine Nutzer gefunden
                                        </p>
                                    )}

                                    {searchResults.map(u => (
                                        <div key={u.id} className="user-item">
                                            <span>{u.username}</span>

                                            <button
                                                disabled={sentRequests.includes(u.id)}
                                                onClick={() => sendFriendRequest(u)}
                                            >
                                                {sentRequests.includes(u.id) ? "Sent" : "+"}
                                            </button>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        )}
                    </>
                )}
            </aside>

            {/* RIGHT PANEL */}
            <main className="main-panel">

                <div className="tabs">
                    <button
                        className={activeTab === "library" ? "active" : ""}
                        onClick={() => setActiveTab("library")}
                    >
                        Bibliothek
                    </button>

                    <button
                        className={activeTab === "store" ? "active" : ""}
                        onClick={() => setActiveTab("store")}
                    >
                        Store
                    </button>
                </div>

                {/* STORE SEARCH */}
                {activeTab === "store" && (
                    <input
                        className="store-search"
                        value={storeQuery}
                        onChange={(e) => setStoreQuery(e.target.value)}
                        onKeyDown={handleStoreSearchKey}
                        placeholder="Spiele suchen..."
                    />
                )}

                <h2>
                    {activeTab === "library"
                        ? "Spielebibliothek"
                        : "Store"}
                </h2>

                <div className="games-grid">
                    {games.map(game => (
                        <div key={game.id} className="game-tile">
                            <div className="game-cover" />
                            <span>{game.title}</span>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}