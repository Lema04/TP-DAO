import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const HeaderNav = () => {
    const { user, logout } = useAuth();
    const location = useLocation(); // ✅ Ahora sí está en el contexto del Router
    const navigate = useNavigate(); // ✅ Ahora sí está en el contexto del Router

    // Se muestra si la ruta NO es /home Y NO es /login
    const showBackButton = location.pathname !== '/home' && location.pathname !== '/login';

    return (
        <header className="App-header">
            <Logo />
            <nav className="App-nav">
                {user ? (
                    <>
                        {showBackButton && (
                            <button onClick={() => navigate('/home')} className="back-button">
                                ← Volver al Menú
                            </button>
                        )}
                        <button onClick={logout} className="logout-button">Salir</button>
                    </>
                ) : (
                    <Link to="/login">Ingresar</Link>
                )}
            </nav>
        </header>
    );
};

export default HeaderNav;