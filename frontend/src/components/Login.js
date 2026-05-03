import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../api';

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const userContext = useContext(UserContext); 

    async function Login(e){
        e.preventDefault();
        try {
            const data = await apiFetch("/users/login", {
                method: "POST",
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            userContext.setUserContext(data);
        } catch {
            setUsername("");
            setPassword("");
            setError("Napacno uporabnisko ime ali geslo.");
        }
    }

    return (
        <main className="page narrow-page">
            {userContext.user ? <Navigate replace to="/" /> : ""}
            <form className="form-panel" onSubmit={Login}>
                <h2>Prijava</h2>
                {error ? <p className="alert">{error}</p> : ""}
                <label>Uporabnisko ime</label>
                <input type="text" name="username" placeholder="Uporabnisko ime"
                 value={username} onChange={(e)=>(setUsername(e.target.value))}/>
                <label>Geslo</label>
                <input type="password" name="password" placeholder="Geslo"
                 value={password} onChange={(e)=>(setPassword(e.target.value))}/>
                <button type="submit">Prijava</button>
            </form>
        </main>
    );
}

export default Login;
