import { useEffect, useContext } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../api';

function Logout(){
    const userContext = useContext(UserContext); 
    useEffect(function(){
        const logout = async function(){
            userContext.setUserContext(null);
            localStorage.removeItem("user");
            await apiFetch("/users/logout").catch(() => {});
        }
        logout();
    }, [userContext]);

    return (
        <Navigate replace to="/" />
    );
}

export default Logout;
