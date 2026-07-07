import { apiFetch } from "./api/apiFetch";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";


export default function Profil() {
    const { user } = useAuth();
    const { logout } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const [bio, setBio] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
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

    };

    const handleLogout = () => {
        logout();
        navigate("/login")
    };

    useEffect(() => {
        async function updateUser() {
            try {
                const res = await apiFetch("/api/auth/me");
                setBio(res.biography);
                setUsername(res.username);
            } catch (err) {
                console.error(err);
            }
        }
        updateUser();
    }, []);

    return (
        < div className="profile-container"  >
            < div className="profile-wrapper" style={styles.container} >
                <button className="back-btn" onClick={() => navigate("/library")}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                    </svg>
                </button>
                <h2>Edit Profile</h2>
                <img
                    src={
                        profileImage ||
                        `${user.profile_image_path || '/uploads/avatars/default.jpg'}`
                    }
                    alt="Profilbild"
                    style={styles.image}
                />

                <input id="profile-picture-upload" type="file" accept="image/*" onChange={handleImageChange} />
                <div className="profile-input-container" style={styles.section}>
                    <h3>Username</h3>
                    <input
                        value={username}
                        onChange={handleUsernameChange}
                    />
                </div>
                <div className="profile-input-container" style={styles.section}>
                    <h3>Biography</h3>
                    <textarea
                        value={bio}
                        onChange={handleBioChange}
                        style={styles.textarea}
                    />
                </div>
                <div style={styles.buttonRow}>
                    <button onClick={saveProfile} style={styles.saveBtn}>
                        Save
                    </button>

                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </div >
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
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