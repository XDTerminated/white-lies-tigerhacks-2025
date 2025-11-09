import { useState, useEffect } from "react";
import "./IntroScene.css";

interface IntroSceneProps {
    onComplete: () => void;
    gameSceneContent: React.ReactNode;
}

export function IntroScene({ onComplete, gameSceneContent }: IntroSceneProps) {
    const [stage, setStage] = useState<"blackout" | "fade" | "crash" | "panel" | "database">("blackout");
    const [shake, setShake] = useState(false);
    const [showBlackOverlay, setShowBlackOverlay] = useState(true);

    useEffect(() => {
        // Start with complete blackness
        const blackoutTimer = setTimeout(() => {
            setStage("fade");
        }, 500);

        // First fade in - show the background (shorter)
        const fadeInTimer = setTimeout(() => {
            setShowBlackOverlay(false);
        }, 1000);

        // Fade back out (shorter visible time)
        const fadeOutTimer = setTimeout(() => {
            setShowBlackOverlay(true);
        }, 2000);

        // Fade in again (shorter)
        const fadeInAgainTimer = setTimeout(() => {
            setShowBlackOverlay(false);
        }, 2500);

        // Fade back to black before crash
        const fadeBeforeCrashTimer = setTimeout(() => {
            setShowBlackOverlay(true);
        }, 3500);

        // Crash happens while screen is black
        const crashTimer = setTimeout(() => {
            setStage("crash");
            setShake(true);
            // Play crash sound here if you have one
        }, 4000);

        // Stop shaking and zoom to panel
        const stopShakeTimer = setTimeout(() => {
            setShake(false);
            setStage("panel");
            setShowBlackOverlay(false); // Reveal the panel
        }, 5000);

        return () => {
            clearTimeout(blackoutTimer);
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(fadeInAgainTimer);
            clearTimeout(fadeBeforeCrashTimer);
            clearTimeout(crashTimer);
            clearTimeout(stopShakeTimer);
        };
    }, []);

    const handleBlueCircleClick = () => {
        setStage("database");
    };

    const handleDatabaseContinue = () => {
        onComplete();
    };

    return (
        <div className={`intro-scene ${shake ? "shake" : ""}`}>
            {/* Game scene in background - non-interactable */}
            <div className="intro-game-scene-background">
                {gameSceneContent}
            </div>

            {/* Black overlay for fades */}
            <div className={`black-overlay ${showBlackOverlay ? "visible" : "hidden"}`}></div>

            {stage === "crash" && (
                <div className="crash-overlay">
                    <div className="crash-text">SYSTEM CRITICAL FAILURE</div>
                </div>
            )}

            {stage === "panel" && (
                <div className="control-panel-zoom">
                    <div 
                        className="control-panel-clickable"
                        onClick={handleBlueCircleClick}
                    >
                        <img src="/Assets/ControlPanel.png" alt="Control Panel" className="control-panel-image" />
                    </div>
                </div>
            )}

            {stage === "database" && (
                <div className="database-fullscreen">
                    <div className="database-header">EMERGENCY CONTACT DATABASE</div>
                    <div className="database-content">
                        <div className="emergency-text">
                            <p>CRITICAL SITUATION DETECTED</p>
                            <p className="separator">---</p>
                            <p>OXYGEN SYSTEMS: COMPROMISED</p>
                            <p>COMMUNICATION ARRAY: DAMAGED</p>
                            <p>TIME REMAINING: 6 MINUTES</p>
                            <p className="separator">---</p>
                            <p>OBJECTIVE: Contact researchers to identify the impostor</p>
                            <p>WARNING: Each communication uses oxygen</p>
                            <p>NOTE: Only ONE researcher is human. Others are AI.</p>
                            <p className="separator">---</p>
                            <p className="final-warning">SURVIVE. IDENTIFY. ESCAPE.</p>
                        </div>
                    </div>
                    <button className="database-continue-btn" onClick={handleDatabaseContinue}>
                        BEGIN MISSION
                    </button>
                </div>
            )}
        </div>
    );
}
