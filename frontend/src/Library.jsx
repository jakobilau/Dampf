import { useState } from "react";
import "./LibraryPage.css";

/* ---------------- DATA ---------------- */

const friends = [
    { id: 1, name: "Max" },
    { id: 2, name: "Anna" },
    { id: 3, name: "Tom" },
];

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

    /* FRIENDS STATES */
    const [addFriendMode, setAddFriendMode] = useState(false);
    const [friendQuery, setFriendQuery] = useState("");

    /* CHAT STATE */
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState({});
    const [chatInput, setChatInput] = useState("");

    /* STORE SEARCH */
    const [storeQuery, setStoreQuery] = useState("");

    const games =
        activeTab === "library"
            ? gamesLibrary
            : storeGames.filter(g =>
                g.title.toLowerCase().includes(storeQuery.toLowerCase())
            );

    /* ---------------- FRIEND SEARCH ---------------- */

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(friendQuery.toLowerCase())
    );

    const enterPressed = (e) => e.key === "Enter";

    const handleFriendSearchKey = (e) => {
        if (enterPressed(e)) {
            console.log("Friend search:", friendQuery);
        }
    };

    const handleStoreSearchKey = (e) => {
        if (enterPressed(e)) {
            console.log("Store search:", storeQuery);
        }
    };

    /* ---------------- CHAT ---------------- */

    const openChat = (user) => {
        setActiveChatUser(user);
        if (!messages[user.id]) {
            setMessages(prev => ({
                ...prev,
                [user.id]: []
            }));
        }
    };

    const sendMessage = () => {
        if (!chatInput.trim()) return;

        const id = activeChatUser.id;

        setMessages(prev => ({
            ...prev,
            [id]: [
                ...(prev[id] || []),
                { text: chatInput, fromMe: true }
            ]
        }));

        setChatInput("");
    };

    const goBackToFriends = () => {
        setActiveChatUser(null);
    };

    /* ---------------- RENDER ---------------- */

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
                            {(messages[activeChatUser.id] || []).map((m, i) => (
                                <div
                                    key={i}
                                    className={`msg ${m.fromMe ? "me" : ""}`}
                                >
                                    {m.text}
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
                                onClick={() => setAddFriendMode(p => !p)}
                            >
                                +
                            </button>
                        </div>

                        {/* LIST */}
                        {!addFriendMode && (
                            <ul className="friends-list">
                                {friends.map(f => (
                                    <li
                                        key={f.id}
                                        className="friend-item"
                                        onClick={() => openChat(f)}
                                    >
                                        {f.name}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* SEARCH USERS */}
                        {addFriendMode && (
                            <div className="add-friend-view">

                                <input
                                    className="friend-search"
                                    value={friendQuery}
                                    onChange={(e) => setFriendQuery(e.target.value)}
                                    onKeyDown={handleFriendSearchKey}
                                    placeholder="User suchen..."
                                    autoFocus
                                />

                                <div className="search-results">
                                    {filteredUsers.map(u => (
                                        <div key={u.id} className="user-item">
                                            <span>{u.name}</span>
                                            <button>Add</button>
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