import { useState, useEffect, useRef } from "react";
import { useAuth } from "./auth/AuthProvider";
import { useMessages } from "./messages/useMessages";
import { apiFetch } from "./api/apiFetch";
import { useNavigate } from "react-router-dom";
import "./LibraryPage.css";
import { useSocket } from "./socket/SocketProvider";
import { useFriendPopup } from "./socket/hooks/useFriendPopup"

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
    const [storeGames, setStoreGames] = useState([]);
    const [libraryGames, setlibraryGames] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState({});
    const [chatInput, setChatInput] = useState("");
    const socket = useSocket();
    const [storeQuery, setStoreQuery] = useState("");
    const { popup, setPopup } = useFriendPopup();

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

        await fetch("/api/friends/accept", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                senderId: popup.user.user_id
            })
        });

        setPopup(null);
        console.log("Freundschaft angenommen:", friendRequest);

        setFriendRequest(null);
    };

    const groupMessagesByDate = (msgs) => {
        const groups = {};

        msgs.forEach((m) => {
            const key = formatChatDate(m.created_at);

            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });

        return groups;
    };

    const formatChatDate = (date) => {
        const d = new Date(date);

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const normalize = (x) =>
            new Date(x.getFullYear(), x.getMonth(), x.getDate());

        const dNorm = normalize(d);
        const tNorm = normalize(today);
        const yNorm = normalize(yesterday);

        if (dNorm.getTime() === tNorm.getTime()) return "Today";
        if (dNorm.getTime() === yNorm.getTime()) return "Yesterday";

        return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}.${d.getFullYear()}`;
    };



    const declineFriendRequest = async () => {
        console.log("Freundschaft abgelehnt:", friendRequest);
        setFriendRequest(null);
        setPopup(null);
    };
    /* ---------------- FRIENDS ---------------- */

    const sendFriendRequest = (receiver) => {
        socket.emit("friend_request_live", {
            toUserId: receiver.user_id,

            fromUser: {
                user_id: user.user_id,
                username: user.username
            }
        });
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
            ? libraryGames
            : storeGames.filter(g =>
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
            console.log(messages)
        } catch (err) {
            console.error(err);
        }
    };

    const createChatMsgTime = (t) => {
        const m = String(t.getMinutes()).padStart(2, "0");
        const h = String(t.getHours()).padStart(2, "0");
        return `${h}:${m}`;
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
                console.log(data);
                setFriendList(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchFriends();
    }, []);

    useEffect(() => {
        async function fetchGames() {
            try {
                const data = await apiFetch("/api/games");
                setStoreGames(data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchGames();
    }, []);

    useEffect(() => {
        async function fetchLibrary() {
            try {
                const data = await apiFetch("/api/library");
                setlibraryGames(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchLibrary();
    }, []);

    const addToLibrary = async (gameId) => {
        try {

            await apiFetch(`/api/library/${gameId}/`, {
                method: "POST"
            });

            const game = storeGames.find(g => g.game_id === gameId);

            if (game)
                setlibraryGames(prev => [...prev, {
                    ...game,
                    is_favored: false
                }]);

        } catch (err) {
            console.error(err);
        }
    };

    const removeFromLibrary = async (gameId) => {
        try {
            await apiFetch(`/api/library/${gameId}/`, {
                method: "DELETE"
            });

            setlibraryGames(prev =>
                prev.filter(g => g.game_id !== gameId)
            );

        } catch (err) {
            console.error(err);
        }
    };

    const toggleFavorite = async (gameId) => {

        try {

            await apiFetch(`/api/library/${gameId}/favorite`, {
                method: "PATCH",
                credentials: "include",
            });

            setlibraryGames(prev =>
                prev.map(g =>
                    g.game_id === gameId
                        ? {
                            ...g,
                            is_favored: !g.is_favored
                        }
                        : g
                )
            );

        } catch (err) {
            console.error(err);
        }
    };

    const isInLibrary = (id) =>
        libraryGames.some(g => g.game_id === id);

    const favoriteGames = libraryGames.filter(g => g.is_favored);

    const normalGames = libraryGames.filter(g => !g.is_favored);

    const currentMessages = activeChatUser
        ? messages[activeChatUser.user_id] || []
        : [];
    const grouped = groupMessagesByDate(currentMessages);
    /* ---------------- UI ---------------- */

    //console.log(libraryGames[0].playtime_minutes);

    return (

        <div className="layout">
            <aside className="friends-panel">
                <div className="profile-tile">
                    <img
                        alt="Profilbild"
                        className="profile-avatar"
                        src={`https://10.72.100.35${activeChatUser?.profile_image_path
                            ? activeChatUser.profile_image_path
                            : "/uploads/avatars/default.jpg"
                            }`}
                    />

                    <div
                        className="profile-info"
                        onClick={() =>
                            activeChatUser ? null : navigate("/profile")
                        }
                    >
                        <span className="profile-name">
                            {activeChatUser?.username || user?.username || "Unknown"}
                        </span>
                    </div>

                    {!activeChatUser && user?.role === "publisher" && (
                        <button
                            className="dashboard-btn"
                            onClick={() => navigate("/dashboard")}
                        >
                            Dashboard
                        </button>
                    )}
                </div>
                {activeChatUser && (
                    <div className="chat-view">
                        <div className="chat-header">
                            <button className="back-btn" onClick={goBackToFriends}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                                    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                                </svg>
                            </button>
                            <h3>{activeChatUser.name}</h3>
                        </div>

                        <div className="chat-messages">
                            {activeChatUser &&
                                Object.entries(groupMessagesByDate(messages[activeChatUser.user_id] || [])).map(([date, msgs]) => (
                                    <div className="chat-msg-group" key={date}>
                                        <div className="chat-date-separator">
                                            {date}
                                        </div>

                                        {msgs.map((m, i) => (
                                            <div key={i} className={`msg ${m.fromMe ? "me" : ""}`}>
                                                <span className="chat-msg-content">{m.content}</span>
                                                <span className="chat-msg-time">
                                                    {createChatMsgTime(new Date(m.created_at))}
                                                </span>
                                            </div>
                                        ))}
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
                            <button className="send-btn" onClick={sendMessage}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" /></svg>
                            </button>
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
                                        <img className="profile-avatar" src={`https://10.72.100.35${f.profile_image_path || '/uploads/avatars/default.jpg'}`} />
                                        <p>{f.username}</p>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                                            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                                        </svg>
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

                {activeTab === "library" ? (

                    <>

                        <h3>Favoriten</h3>

                        <div className="games-grid">

                            {favoriteGames.map(game => (

                                <div key={game.game_id} className="game-tile">

                                    <img
                                        className="game-cover"
                                        src={
                                            game.folder_name
                                                ? `https://10.72.100.35${game.folder_name}display.png`
                                                : `https://10.72.100.35/games/under_construction.png`
                                        }
                                    />

                                    <span className="game-title">{game.title}</span>
                                    <span className="game-genre">{game.genre}</span>
                                    <span className="game-playtime">Total: {game.playtime_minutes / 60} hrs</span>
                                    <div className="game-actions">

                                        <button
                                            onClick={() => toggleFavorite(game.game_id)}
                                        >
                                            ☆
                                        </button>

                                        <button
                                            onClick={() => {
                                                localStorage.setItem(
                                                    "active_game_session",
                                                    JSON.stringify({
                                                        game_id: game.game_id,
                                                        started_at: Date.now()
                                                    })
                                                );
                                                window.location.href =
                                                    `https://10.72.100.35${game.folder_name}index.html`
                                            }
                                            }>
                                            Starten
                                        </button>

                                        <button
                                            onClick={() => removeFromLibrary(game.game_id)}
                                            className="remove-btn"
                                        >
                                            Entfernen
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                        <h3>Alle Spiele</h3>

                        <div className="games-grid">

                            {normalGames.map(game => (

                                <div key={game.game_id} className="game-tile">

                                    <img
                                        className="game-cover"
                                        src={
                                            game.folder_name
                                                ? `https://10.72.100.35${game.folder_name}display.png`
                                                : `https://10.72.100.35/games/under_construction.png`
                                        }
                                    />

                                    <span className="game-title">{game.title}</span>
                                    <span className="game-genre">{game.genre}</span>
                                    <span className="game-playtime">Total: {game.playtime_minutes / 60} hrs</span>
                                    <div className="game-actions">

                                        <button
                                            onClick={() => toggleFavorite(game.game_id)}
                                        >
                                            ☆
                                        </button>

                                        <button
                                            onClick={() => {
                                                localStorage.setItem(
                                                    "active_game_session",
                                                    JSON.stringify({
                                                        game_id: game.game_id,
                                                        started_at: Date.now()
                                                    })
                                                );
                                                window.location.href =
                                                    `https://10.72.100.35${game.folder_name}index.html`
                                            }
                                            }
                                        >
                                            Starten
                                        </button>

                                        <button
                                            onClick={() => removeFromLibrary(game.game_id)}
                                            className="remove-btn"
                                        >
                                            Entfernen
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </>

                ) : (

                    <div className="games-grid">

                        {games.map(game => (

                            <div key={game.game_id} className="game-tile">

                                <img
                                    className="game-cover"
                                    src={
                                        game.folder_name
                                            ? `https://10.72.100.35${game.folder_name}display.png`
                                            : `https://10.72.100.35/games/under_construction.png`
                                    }
                                />

                                <span className="game-title">{game.title}</span>
                                <span className="game-genre">{game.genre}</span>
                                {isInLibrary(game.game_id) ? (

                                    <button
                                        className="library-button added"
                                        disabled
                                    >
                                        ✓ In Bibliothek
                                    </button>

                                ) : (

                                    <button
                                        className="library-button"
                                        onClick={() => addToLibrary(game.game_id)}
                                    >
                                        + Hinzufügen
                                    </button>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </main>
            {popup && (
                <div className="popup-overlay">
                    <div className="friend-request-popup">

                        <p>
                            {popup.user.username} wants to be your friend.
                        </p>

                        <div className="popup-buttons">

                            <button
                                onClick={acceptFriendRequest}
                            >
                                Accept
                            </button>

                            <button
                                onClick={declineFriendRequest}
                            >
                                Decline
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div >
    );
}