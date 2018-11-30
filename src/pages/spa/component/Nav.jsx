import React from 'react';
import PropTypes from 'prop-types';
import header from '../../_commons/header.ejs';

const Nav = ({ location }) => {
  const ejs = header({
    active: location.pathname === '/spa/page3' ? 'page3' : 'page4',
  });
  return <div dangerouslySetInnerHTML={{ __html: ejs }} />;
};

Nav.propTypes = {
  location: PropTypes.shape({
    hash: PropTypes.string,
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
};

export default Nav;
