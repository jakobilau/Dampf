import { useState, useEffect, useRef } from "react";
import { useAuth } from "./auth/AuthProvider";
import { useMessages } from "./messages/useMessages";
import { apiFetch } from "./api/apiFetch";
import { useNavigate } from "react-router-dom";
import "./LibraryPage.css";

const gamesLibrary = [
    { id: 1, title: "Minecraft" },
    { id: 2, title: "Terraria" },
];

const storeGames = [
    { id: 201, title: "Elden Ring" },
    { id: 202, title: "Hades" },
    { id: 203, title: "Cyberpunk 2077" },
];

export default function LibraryPage() {
    const { user } = useAuth();
    const currentUserId = user?.user_id;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("library");
    const [searchSubmitted, setSearchSubmitted] = useState(false);
    const [sentRequests, setSentRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [friendRequest, setFriendRequest] = useState(null);
    const [addFriendMode, setAddFriendMode] = useState(false);
    const [friendQuery, setFriendQuery] = useState("");
    const [friendList, setFriendList] = useState([]);

    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState({});
    const [chatInput, setChatInput] = useState("");

    const [storeQuery, setStoreQuery] = useState("");

    const activeChatRef = useRef(null);

    useEffect(() => {
        activeChatRef.current = activeChatUser;
    }, [activeChatUser]);

    /* ---------------- SOCKET MESSAGES ---------------- */

    useMessages((msg) => {
        if (!currentUserId) return;

        const otherUserId =
            msg.sender_id === currentUserId
                ? msg.receiver_id
                : msg.sender_id;

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

    const acceptFriendRequest = async () => {
        // API-Aufruf zum Annehmen
        console.log("Freundschaft angenommen:", friendRequest);

        setFriendRequest(null);
    };

    const declineFriendRequest = async () => {
        // API-Aufruf zum Ablehnen
        console.log("Freundschaft abgelehnt:", friendRequest);

        setFriendRequest(null);
    };
    /* ---------------- FRIENDS ---------------- */

    const sendFriendRequest = (user) => {
        setSentRequests((prev) => [...prev, user.id]);
    };

    const handleFriendSearchKey = async (e) => {
        if (e.key !== "Enter") return;

        try {
            const data = await apiFetch(
                `/api/users/friends/search?query=${friendQuery}`
            );

            setSearchResults(data);
            setSearchSubmitted(true);
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- STORE ---------------- */

    const games =
        activeTab === "library"
            ? gamesLibrary
            : storeGames.filter((g) =>
                g.title.toLowerCase().includes(storeQuery.toLowerCase())
            );

    const handleStoreSearchKey = (e) => {
        if (e.key === "Enter") {
            console.log("Store search:", storeQuery);
        }
    };

    /* ---------------- CHAT ---------------- */

    const openChat = async (user) => {
        setActiveChatUser(user);

        try {
            const data = await apiFetch(`/api/messages/${user.user_id}`);

            const formatted = data.map((m) => ({
                ...m,
                fromMe: m.sender_id === currentUserId,
            }));

            setMessages((prev) => ({
                ...prev,
                [user.user_id]: formatted,
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async () => {
        const content = chatInput.trim();
        if (!content || !activeChatUser) return;

        try {
            await apiFetch("/api/messages", {
                method: "POST",
                body: JSON.stringify({
                    receiverId: activeChatUser.user_id,
                    content,
                }),
            });

            const newMessage = {
                message_id: Date.now(),
                sender_id: currentUserId,
                receiver_id: activeChatUser.user_id,
                content,
                created_at: new Date().toISOString(),
                fromMe: true,
            };

            setMessages((prev) => ({
                ...prev,
                [activeChatUser.user_id]: [
                    ...(prev[activeChatUser.user_id] || []),
                    newMessage,
                ],
            }));

            setChatInput("");
        } catch (err) {
            console.error(err);
        }
    };

    const goBackToFriends = () => {
        setActiveChatUser(null);
    };

    /* ---------------- FRIENDS LIST ---------------- */

    useEffect(() => {
        async function fetchFriends() {
            try {
                const data = await apiFetch("/api/friends");
                setFriendList(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchFriends();
    }, []);

    /* ---------------- UI ---------------- */

    return (
        <div className="layout">
            <aside className="friends-panel">
                <div className="profile-tile">
                    <img

                        alt="Profilbild"
                        className="profile-avatar"
                        src={`http://10.72.100.35${user.profile_image_path}`}
                    />
                    <div className="profile-info" onClick={() => navigate("/profile")}>
                        <span className="profile-name">
                            {user?.username || "Unknown"}
                        </span>
                    </div>
                </div>
                {activeChatUser && (
                    <div className="chat-view">

                        <div className="chat-header">
                            <button onClick={goBackToFriends}>← Back</button>
                            <h3>{activeChatUser.name}</h3>
                        </div>

                        <div className="chat-messages">
                            {(messages[activeChatUser.user_id] || []).map((m, i) => (
                                <div key={i} className={`msg ${m.fromMe ? "me" : ""}`}>
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
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                )}

                {!activeChatUser && (
                    <>
                        <div className="friends-header">
                            <h2>Freundesliste</h2>

                            <button
                                className={`add-btn ${addFriendMode ? "active" : ""}`}
                                onClick={() => {
                                    setAddFriendMode((p) => !p);
                                    setSearchSubmitted(false);
                                    setFriendQuery("");
                                }}
                            >
                                +
                            </button>
                        </div>

                        {!addFriendMode && (
                            <ul className="friends-list">
                                {friendList.map((f) => (
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

                                    {searchResults.map((u) => (
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
                    {games.map((game) => (
                        <div key={game.id} className="game-tile">
                            <div className="game-cover" />

                            <span>{game.title}</span>

                            <button
                                className="play-button"
                                onClick={() => console.log(`Starte ${game.title}`)}
                            >
                                Starten
                            </button>
                        </div>
                    ))}
                </div>

            </main>
            {friendRequest && (
                <div className="popup-overlay">
                    <div className="friend-request-popup">
                        <h3>Freundschaftsanfrage</h3>

                        <p>
                            <strong>{friendRequest.username}</strong> möchte dich als Freund hinzufügen.
                        </p>

                        <div className="popup-buttons">
                            <button onClick={acceptFriendRequest}>
                                Ja
                            </button>

                            <button onClick={declineFriendRequest}>
                                Nein
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}