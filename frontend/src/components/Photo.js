import { Link } from 'react-router-dom';
import { API_URL } from '../api';

function formatDate(date) {
    return new Date(date).toLocaleDateString('sl-SI', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function Photo(props){
    const score = (props.photo.likes || 0) - (props.photo.dislikes || 0);

    return (
        <article className="photo-card">
            <Link to={`/photos/${props.photo._id}`} className="photo-card-image">
                <img src={`${API_URL}${props.photo.path}`} alt={props.photo.title}/>
            </Link>
            <div className="photo-card-body">
                <h2><Link to={`/photos/${props.photo._id}`}>{props.photo.title}</Link></h2>
                <p>{props.photo.message}</p>
                <div className="photo-meta">
                    <span>{props.photo.postedBy?.username || 'Anonimno'}</span>
                    <span>{formatDate(props.photo.createdAt)}</span>
                    <span>{score} glasov</span>
                </div>
            </div>
        </article>
    );
}

export default Photo;
