import React from 'react';
import { NavLink } from 'react-router-dom';

const style = {
  active: { color: '#03a9f4', fontWeight: 500 },
};

const Nav = () => (
  <nav className="nav">
    <ul>
      <a href="separate/page1.html">
        <li>Page 1</li>
      </a>
      <a href="separate/page2.html">
        <li>Page 2</li>
      </a>
      <NavLink activeStyle={style.active} exact to="/spa/page3">
        <li>Page 3</li>
      </NavLink>
      <NavLink activeStyle={style.active} exact to="/spa/page4">
        <li>Page 4</li>
      </NavLink>
    </ul>
  </nav>
);

export default Nav;
