import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import './sidebar.scss'
export default props => {
  return (
    <Menu right>
      <a className="side-menu-item" href="/">Home</a>
      <a className="side-menu-item" href="/about">About</a>
      <a className="side-menu-item" href="/contacts">Contacts</a>
      <a className="side-menu-item" href="/settings">Settings</a>
    </Menu>
  );
};
