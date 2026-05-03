import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../api';

function Profile(){
    const userContext = useContext(UserContext); 
    const [profile, setProfile] = useState({});

    useEffect(function(){
        const getProfile = async function(){
            try {
                const data = await apiFetch("/users/profile");
                setProfile(data);
            } catch (err) {
                setProfile({});
            }
        }
        getProfile();
    }, []);

    return (
        <main className="page narrow-page">
            {!userContext.user ? <Navigate replace to="/login" /> : ""}
            <section className="profile-panel">
                <h2>Profil</h2>
                <p><strong>Uporabnisko ime:</strong> {profile.username}</p>
                <p><strong>Email:</strong> {profile.email}</p>
            </section>
        </main>
    );
}

export default Profile;
