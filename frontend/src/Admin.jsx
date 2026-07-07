import { useEffect, useState } from "react";
import { apiFetch } from "./api/apiFetch";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

export default function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [games, setGames] = useState([]);

    useEffect(() => {

        loadUsers();
        loadGames();

    }, []);

    async function loadUsers() {
        const data = await apiFetch("/api/users");
        setUsers(data);
    }

    async function loadGames() {
        const data = await apiFetch("/api/games");
        setGames(data);
    }

    async function deleteGame(id) {

        await apiFetch(`/api/games/${id}`, {
            method: "DELETE"
        });

        setGames(games.filter(g => g.game_id !== id));
    }

    async function banUser(id) {

        await apiFetch(`/api/users/${id}`, {
            method: "DELETE"
        });

        setUsers(users.filter(u => u.user_id !== id));
    }

    return (



        <div className="admin-page">
            <button className="back-btn" onClick={() => {navigate("/library")}}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                </svg>
            </button>
            <div className="admin-column">

                <h2>GAMES ({games.length})</h2>

                {games.map(game => (

                    <div className="admin-item" key={game.game_id}>

                        <span>{game.title}</span>

                        <button
                            className="delete-btn"
                            onClick={() => deleteGame(game.game_id)}
                        >
                            DELETE
                        </button>

                    </div>

                ))}

            </div>

            <div className="admin-column">

                <h2>USER ({users.length})</h2>

                {users.map(user => (

                    <div className="admin-item" key={user.user_id}>

                        <span>{user.username}</span>

                        <button
                            className="ban-btn"
                            onClick={() => banUser(user.user_id)}
                        >
                            DELETE
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );

}