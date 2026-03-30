import React from 'react';

function Sidebar({ navItems, activeTab, setActiveTab, sidebarProfile }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">
          Ethi<span>Chain</span>
        </div>
        <div className="tagline">Espace Fournisseur</div>
      </div>

      <div className="nav-section-label">Navigation</div>
      {navItems.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
          {item.badge ? <span className="badge">{item.badge}</span> : null}
        </div>
      ))}

      <div className="nav-section-label">Compte</div>
      {navItems.slice(5).map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </div>
      ))}
      <div className="nav-item">
        <span className="icon">⚙️</span> Paramètres
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{sidebarProfile.initials}</div>
          <div className="user-info">
            <div className="name">{sidebarProfile.name}</div>
            <div className="role">{sidebarProfile.role}</div>
          </div>
          <div className="verified-badge">✔ Vérifié</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
