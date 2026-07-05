import { apiFetch } from "./api/apiFetch";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";


export default function Profil() {
    const { user } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const [bio, setBio] = useState(user.biography);
    const [username, setUsername] = useState(user.username);
    const navigate = useNavigate();
    // Bild auswählen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
            uploadAvatar(file);
        }
    };

    const uploadAvatar = async (file) => {
        const formData = new FormData();
        formData.append("avatar", file);

        const res = await apiFetch("/api/profile/avatar", {
            method: "PATCH",
            body: formData,
        });

        const data = await res.json();
        return data.avatar_url;
    };

    // Bio speichern
    const handleBioChange = (e) => {
        setBio(e.target.value);
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value)
    };

    const saveProfile = async () => {
        await apiFetch("/api/profile", {
            method: "PATCH",
            body: JSON.stringify({
                username: username,
                biography: bio
            })
        });

        console.log("Gespeicherte Bio:", bio);
        console.log("Profilbild:", profileImage);
    };

    // Logout
    const handleLogout = () => {
        // TODO: Token löschen / API logout
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    console.log(user);


    return (

        < div style={styles.container} >
            <button onClick={() => navigate("/library")}>Back</button>
            <h2>Profil bearbeiten</h2>

            {/* Profilbild */}
            <div style={styles.section}>
                <img
                    src={
                        profileImage ||
                        `http://10.72.100.35${user.profile_image_path}`
                    }
                    alt="Profilbild"
                    style={styles.image}
                />

                <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            <div style={styles.section}>
                <h3>Username</h3>
                <input
                    value={username}
                    onChange={handleUsernameChange}
                    style={styles.textarea}
                />
            </div>
            {/* Bio */}
            <div style={styles.section}>
                <h3>Bio</h3>
                <textarea
                    value={bio}
                    onChange={handleBioChange}
                    style={styles.textarea}
                />
            </div>

            {/* Buttons */}
            <div style={styles.buttonRow}>
                <button onClick={saveProfile} style={styles.saveBtn}>
                    Speichern
                </button>

                <button onClick={handleLogout} style={styles.logoutBtn}>
                    Logout
                </button>
            </div>
        </div >
    );
}

const styles = {
    container: {
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial",
    },
    section: {
        marginBottom: "20px",
    },
    image: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        objectFit: "cover",
        display: "block",
        marginBottom: "10px",
    },
    textarea: {
        width: "100%",
        height: "100px",
        padding: "10px",
    },
    buttonRow: {
        display: "flex",
        justifyContent: "space-between",
    },
    saveBtn: {
        padding: "10px 15px",
        backgroundColor: "green",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    logoutBtn: {
        padding: "10px 15px",
        backgroundColor: "red",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
};