import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeMenu = () => {
  const { hasPermission, user } = useAuth();

  const menuSections = [
    {
      title: '📋 Gestión de Clientes y Vehículos',
      color: '#cc0000',
      items: [
        { permission: 'RegistroCliente', to: '/clientes', label: 'Registrar Cliente', icon: '👤' },
        { permission: 'RegistroCliente', to: '/listado-clientes', label: 'Listado de Clientes', icon: '👥' },
        { permission: 'RegistrarVehiculo', to: '/registrar-vehiculo', label: 'Registrar Vehículo', icon: '🚗' },
        { permission: 'RegistrarVehiculo', to: '/listado-vehiculos', label: 'Listado de Vehículos', icon: '🚙' },
      ]
    },
    {
      title: '🏢 Administración',
      color: '#4a148c',
      items: [
        { permission: 'RegistrarEmpleado', to: '/registrar-empleado', label: 'Registrar Empleado', icon: '👔' },
      ]
    },
    {
      title: '🔑 Reservas y Alquileres',
      color: '#d32f2f',
      items: [
        { permission: 'CrearReserva', to: '/crear-reserva', label: 'Crear Reserva', icon: '📅' },
        { permission: 'GestionReservas', to: '/gestion-reservas', label: 'Gestionar Reservas', icon: '📊' },
        { permission: 'RegistroAlquiler', to: '/alquiler', label: 'Registrar Alquiler', icon: '🔑' },
        { permission: 'RegistroAlquiler', to: '/listado-alquileres', label: 'Listado de Alquileres', icon: '📋' },
      ]
    },
    {
      title: '⚠️ Multas y Daños',
      color: '#b71c1c',
      items: [
        { permission: 'GestionMultas', to: '/gestion', label: 'Gestión de Multas', icon: '⚠️' },
        { permission: 'MisMultas', to: '/mis-multas', label: 'Mis Multas', icon: '📋' },
      ]
    },
    {
      title: '👤 Mi Cuenta',
      color: '#8b0000',
      items: [
        { permission: 'MisAlquileres', to: '/mis-alquileres', label: 'Mis Alquileres', icon: '🚘' },
      ]
    },
    {
      title: '📈 Reportes',
      color: '#660000',
      items: [
        { permission: 'Reportes', to: '/reportes', label: 'Reportes Estratégicos', icon: '📊' },
      ]
    },
  ];

  return (
    <div className="form-card wide" style={{ maxWidth: '1200px' }}>
      <h2 className="form-title">
        Bienvenido, {user?.nombre_usuario || 'Usuario'}
      </h2>
      
      {menuSections.map((section, idx) => {
        const visibleItems = section.items.filter(item => hasPermission(item.permission));
        if (visibleItems.length === 0) return null;

        return (
          <div key={idx} style={{ marginBottom: '2rem' }}>
            <h3 style={{
              color: section.color,
              fontSize: '1.1rem',
              marginBottom: '1rem',
              borderBottom: `2px solid ${section.color}`,
              paddingBottom: '0.5rem',
              fontWeight: '600'
            }}>
              {section.title}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {visibleItems.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  to={item.to}
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.25rem',
                    backgroundColor: '#fff',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    color: '#333',
                    fontWeight: '500',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = section.color;
                    e.currentTarget.style.backgroundColor = '#fff5f5';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(204,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HomeMenu;