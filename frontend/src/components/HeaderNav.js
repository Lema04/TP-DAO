import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const HeaderNav = () => {
    const { user, logout } = useAuth();
    const location = useLocation(); 
    const navigate = useNavigate(); 

    // Se muestra si la ruta NO es /home Y NO es /login
    const showBackButton = location.pathname !== '/home' && location.pathname !== '/login';

    return (
        <header className="App-header">
            <Logo />
            <nav className="App-nav">
                {user ? (
                    <>
                        {showBackButton && (
                            <button onClick={() => navigate('/home')} className="header-btn">
                                ← Volver
                            </button>
                        )}
                        <button onClick={logout} className="header-btn">
                            Salir
                        </button>
                    </>
                ) : (
                    <Link to="/login" style={{color: 'white', textDecoration: 'none', fontWeight: 'bold'}}>Ingresar</Link>
                )}
            </nav>
        </header>
    );
};

export default HeaderNav;