import { useEffect, useState } from "react";
import { apiFetch } from "./api/apiFetch";
import "./Admin.css";

export default function AdminPage() {

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

            <div className="admin-column">

                <h2>Spiele</h2>

                {games.map(game => (

                    <div className="admin-item" key={game.game_id}>

                        <span>{game.title}</span>

                        <button
                            className="delete-btn"
                            onClick={() => deleteGame(game.game_id)}
                        >
                            Löschen
                        </button>

                    </div>

                ))}

            </div>

            <div className="admin-column">

                <h2>Benutzer</h2>

                {users.map(user => (

                    <div className="admin-item" key={user.user_id}>

                        <span>{user.username}</span>

                        <button
                            className="ban-btn"
                            onClick={() => banUser(user.user_id)}
                        >
                            Sperren
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );

}