import { useContext, useState } from 'react'
import { Navigate } from 'react-router-dom';
import { UserContext } from '../userContext';
import { apiFetch } from '../api';

function AddPhoto() {
    const userContext = useContext(UserContext); 
    const[title, setTitle] = useState('');
    const[message, setMessage] = useState('');
    const[file, setFile] = useState('');
    const[uploaded, setUploaded] = useState(false);
    const[error, setError] = useState('');

    async function onSubmit(e){
        e.preventDefault();

        if(!title.trim() || !message.trim()){
            setError("Vnesite naslov in sporocilo.");
            return;
        }

        if(!file){
            setError("Izberite sliko.");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('message', message);
        formData.append('image', file);

        try {
            await apiFetch('/photos', {
                method: 'POST',
                body: formData
            });
            setUploaded(true);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="page narrow-page">
            {!userContext.user ? <Navigate replace to="/login" /> : ""}
            {uploaded ? <Navigate replace to="/" /> : ""}
            <form className="form-panel" onSubmit={onSubmit}>
                <h2>Objavi sliko</h2>
                {error ? <p className="alert">{error}</p> : ""}
                <label>Naslov</label>
                <input type="text" name="title" placeholder="Naslov slike" value={title} onChange={(e)=>{setTitle(e.target.value)}}/>
                <label>Sporocilo</label>
                <textarea name="message" placeholder="Opis ali sporocilo" value={message} onChange={(e)=>{setMessage(e.target.value)}}/>
                <label>Izberi sliko</label>
                <input type="file" id="file" accept="image/*" onChange={(e)=>{setFile(e.target.files[0])}}/>
                <button type="submit">Nalozi</button>
            </form>
        </main>
    )
}

export default AddPhoto;
