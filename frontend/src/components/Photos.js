import { useState, useEffect } from 'react';
import Photo from './Photo';
import { apiFetch } from '../api';

function Photos(props){
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState("");

    useEffect(function(){
        const getPhotos = async function(){
            try {
                const data = await apiFetch(props.ranked ? "/photos/ranked" : "/photos");
                setPhotos(data);
                setError("");
            } catch (err) {
                setError(err.message);
            }
        }
        getPhotos();
    }, [props.ranked]);

    return(
        <main className="page">
            <section className="page-heading">
                <h2>{props.ranked ? "Najboljse slike" : "Najnovejse slike"}</h2>
                <p>{props.ranked ? "Razvrsceno po glasovih, ki s casom izgubljajo vrednost." : "Sveze objave so vedno na vrhu."}</p>
            </section>
            {error ? <p className="alert">{error}</p> : ""}
            <section className="photo-grid">
                {photos.map(photo=>(<Photo photo={photo} key={photo._id}></Photo>))}
            </section>
            {!photos.length && !error ? <p className="empty-state">Ni se objavljenih slik.</p> : ""}
        </main>
    );
}

export default Photos;
