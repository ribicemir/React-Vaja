import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { apiFetch, API_URL } from "../api";
import { UserContext } from "../userContext";

function formatDate(date) {
    return new Date(date).toLocaleString("sl-SI");
}

function PhotoDetails() {
    const { id } = useParams();
    const userContext = useContext(UserContext);
    const [photo, setPhoto] = useState(null);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [hidden, setHidden] = useState(false);

    useEffect(function() {
        const loadPhoto = async function() {
            try {
                const data = await apiFetch(`/photos/${id}`);
                setPhoto(data);
            } catch (err) {
                setError(err.message);
            }
        };

        loadPhoto();
    }, [id]);

    async function vote(value) {
        try {
            const data = await apiFetch(`/photos/${id}/vote`, {
                method: "POST",
                body: JSON.stringify({ value })
            });
            setPhoto(data);
            setNotice("Glas je shranjen.");
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    async function addComment(e) {
        e.preventDefault();

        if (!comment.trim()) {
            setError("Vnesite komentar.");
            return;
        }

        try {
            const data = await apiFetch(`/photos/${id}/comments`, {
                method: "POST",
                body: JSON.stringify({ message: comment })
            });
            setPhoto(data);
            setComment("");
            setNotice("Komentar je dodan.");
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    async function reportPhoto() {
        try {
            const data = await apiFetch(`/photos/${id}/report`, {
                method: "POST",
                body: JSON.stringify({})
            });
            setNotice(data.hidden ? "Slika je bila skrita zaradi prijav." : "Prijava je shranjena.");
            setHidden(data.hidden);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }

    if (hidden) {
        return <Navigate replace to="/" />;
    }

    if (!photo && !error) {
        return <main className="page"><p className="empty-state">Nalaganje slike...</p></main>;
    }

    if (error && !photo) {
        return <main className="page"><p className="alert">{error}</p></main>;
    }

    const score = (photo.likes || 0) - (photo.dislikes || 0);

    return (
        <main className="page detail-page">
            {error ? <p className="alert">{error}</p> : ""}
            {notice ? <p className="notice">{notice}</p> : ""}
            <article className="photo-detail">
                <img src={`${API_URL}${photo.path}`} alt={photo.title} />
                <div className="photo-detail-body">
                    <Link className="back-link" to="/">Nazaj na slike</Link>
                    <h2>{photo.title}</h2>
                    <p>{photo.message}</p>
                    <div className="photo-meta">
                        <span>{photo.postedBy?.username || "Anonimno"}</span>
                        <span>{formatDate(photo.createdAt)}</span>
                        <span>{score} glasov</span>
                    </div>
                    <div className="action-row">
                        <button disabled={!userContext.user} onClick={() => vote("like")}>Like ({photo.likes || 0})</button>
                        <button disabled={!userContext.user} onClick={() => vote("dislike")}>Dislike ({photo.dislikes || 0})</button>
                        <button disabled={!userContext.user} className="danger" onClick={reportPhoto}>Prijavi</button>
                    </div>
                    {!userContext.user ? <p className="helper-text">Za glasovanje, komentar ali prijavo se morate prijaviti.</p> : ""}
                </div>
            </article>

            <section className="comments-panel">
                <h3>Komentarji</h3>
                {userContext.user ? (
                    <form onSubmit={addComment} className="comment-form">
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Dodaj komentar" />
                        <button type="submit">Komentiraj</button>
                    </form>
                ) : ""}
                <div className="comments-list">
                    {photo.comments?.map(item => (
                        <article className="comment" key={item._id}>
                            <strong>{item.postedBy?.username || "Anonimno"}</strong>
                            <span>{formatDate(item.createdAt)}</span>
                            <p>{item.message}</p>
                        </article>
                    ))}
                    {!photo.comments?.length ? <p className="empty-state">Ni komentarjev.</p> : ""}
                </div>
            </section>
        </main>
    );
}

export default PhotoDetails;
