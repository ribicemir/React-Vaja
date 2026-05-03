import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../api';

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [registered, setRegistered] = useState(false);

    async function Register(e){
        e.preventDefault();

        if (!email || !username || !password) {
            setError("Vsa polja so obvezna.");
            return;
        }

        try {
            await apiFetch("/users", {
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    username: username,
                    password: password
                })
            });
            setRegistered(true);
        } catch (err) {
            setUsername("");
            setPassword("");
            setEmail("");
            setError(err.message || "Registracija ni uspela.");
        }
    }

    return(
        <main className="page narrow-page">
            {registered ? <Navigate replace to="/login" /> : ""}
            <form className="form-panel" onSubmit={Register}>
                <h2>Registracija</h2>
                {error ? <p className="alert">{error}</p> : ""}
                <label>Email</label>
                <input type="email" name="email" placeholder="Email" value={email} onChange={(e)=>(setEmail(e.target.value))} />
                <label>Uporabnisko ime</label>
                <input type="text" name="username" placeholder="Uporabnisko ime" value={username} onChange={(e)=>(setUsername(e.target.value))}/>
                <label>Geslo</label>
                <input type="password" name="password" placeholder="Geslo" value={password} onChange={(e)=>(setPassword(e.target.value))} />
                <button type="submit">Registracija</button>
            </form>
        </main>
    );
}

export default Register;
