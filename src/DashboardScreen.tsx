import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getGameSessions, type GameSession } from "./services/api";
import "./DashboardScreen.css";

interface DashboardScreenProps {
    onStartNewGame: () => void;
    onViewSession: (gameId: string) => void;
}

export default function DashboardScreen({ onStartNewGame, onViewSession }: DashboardScreenProps) {
    const { user, logout } = useAuth0();
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadSessions() {
            if (!user?.email) return;

            try {
                setIsLoading(true);
                setError(null);
                const gameSessions = await getGameSessions(user.email);
                // Sort by start_time descending (newest first)
                const sorted = gameSessions.sort((a, b) =>
                    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
                );
                setSessions(sorted);
            } catch (err) {
                console.error("Failed to load game sessions:", err);
                setError("Failed to load mission history");
            } finally {
                setIsLoading(false);
            }
        }

        loadSessions();
    }, [user?.email]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const getOutcomeBadge = (outcome?: string) => {
        if (!outcome) return <span className="outcome-badge pending">IN PROGRESS</span>;

        switch (outcome.toLowerCase()) {
            case 'win':
                return <span className="outcome-badge win">✓ WIN</span>;
            case 'lose':
                return <span className="outcome-badge lose">✗ LOSE</span>;
            case 'oxygen':
                return <span className="outcome-badge oxygen">⚠ OXYGEN FAILURE</span>;
            default:
                return <span className="outcome-badge">{outcome.toUpperCase()}</span>;
        }
    };

    return (
        <div className="dashboard-container">
            <button
                className="logout-button-dashboard"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                title="Logout"
            >
                Logout
            </button>

            <div className="dashboard-content">
                <h1 className="dashboard-title">MISSION HISTORY DATABASE</h1>
                <p className="dashboard-subtitle">Past Planetary Research Missions</p>

                {isLoading && (
                    <div className="dashboard-loading">
                        <div className="loading-text">Loading mission records...</div>
                    </div>
                )}

                {error && (
                    <div className="dashboard-error">
                        <div className="error-text">{error}</div>
                    </div>
                )}

                {!isLoading && !error && sessions.length === 0 && (
                    <div className="dashboard-empty">
                        <div className="empty-text">No missions on record</div>
                        <p className="empty-subtext">Begin your first planetary research mission</p>
                    </div>
                )}

                {!isLoading && !error && sessions.length > 0 && (
                    <div className="sessions-list">
                        {sessions.map((session) => (
                            <div key={session.game_id} className="session-card">
                                <div className="session-header">
                                    <div className="session-date">{formatDate(session.start_time)}</div>
                                    {getOutcomeBadge(session.outcome)}
                                </div>
                                <div className="session-details">
                                    <div className="session-row">
                                        <span className="session-label">Researcher:</span>
                                        <span className="session-value">{session.selected_researcher || 'Unknown'}</span>
                                    </div>
                                    <div className="session-row">
                                        <span className="session-label">Planet:</span>
                                        <span className="session-value">{session.selected_planet || 'Unknown'}</span>
                                    </div>
                                </div>
                                <button
                                    className="view-details-btn"
                                    onClick={() => onViewSession(session.game_id)}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button className="start-mission-btn" onClick={onStartNewGame}>
                    START NEW MISSION
                </button>
            </div>
        </div>
    );
}
