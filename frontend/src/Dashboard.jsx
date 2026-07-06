import { useEffect, useState } from "react";
import { apiFetch } from "./api/apiFetch";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        async function fetchDashboard() {
            try {
                const data = await apiFetch("/api/dashboard/publisher", {
                    credentials: "include"
                });
                console.log(data);
                setGames(data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    const formatPlaytime = (minutes) => {
        if (!minutes && minutes !== 0) return "0m";

        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;

        return `${h}h ${m}m`;
    };

    if (loading) {
        return <div className="dashboard-loading">Lade Dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <h1>Game Dashboard</h1>

            <div className="dashboard-grid">
                {games.map((game) => (
                    <div key={game.game_id} className="dashboard-card">

                        <div className="game-header">
                            <img
                                src={
                                    game.folder_name
                                        ? `https://10.72.100.35${game.folder_name}display.png`
                                        : "https://10.72.100.35/games/under_construction.png"
                                }
                                alt={game.title}
                                className="game-cover"
                            />
                            <h2>{game.title}</h2>
                        </div>

                        <div className="metrics">

                            <div className="metric">
                                <span className="label">Total Playtime </span>
                                <span className="value">
                                    {formatPlaytime(game.total_playtime)}
                                </span>
                            </div>

                            <div className="metric">
                                <span className="label">Total favorites:</span>
                                <span className="value">
                                    {game.favorites_count}
                                </span>
                            </div>

                            <div className="metric">
                                <span className="label">Total installs: </span>
                                <span className="value">
                                    {game.library_count}
                                </span>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}