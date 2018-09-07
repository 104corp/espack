/* eslint-disable react/style-prop-object */
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getReactStar } from '../redux/modules/reactStar';


class Page4 extends React.Component {
  handleOpen = (event) => {
    if (process.env.NODE_ENV === 'production') {
      event.preventDefault();
      alert('Only for 開發模式才有 proxy 功能');
    }
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <meta name="description" content="SPA 其他頁" />
          <title>SPA Page4</title>
          <body style="background-color: honeydew;" />
        </Helmet>
        <i className="material-icons">&#xE8D0;</i>
        <h1 className="title">頁面四</h1>
        <i className="material-icons">&#xE8D0;</i>
        <br />
        <p>代理實際線上網站平台進來，但替換部分資源</p>
        <a href="/104/jobbank/faq/" target="_blank" onClick={this.handleOpen}>Proxy 104 FAQ</a>
        <br />
        <br />
        <p>redux-observable</p>
        <button onClick={this.props.getReactStar}>Get React Star: {this.props.reactStar}</button>
      </React.Fragment>
    );
  }
}

Page4.propTypes = {
  reactStar: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  getReactStar: PropTypes.func.isRequired,
};

Page4.defaultProps = {};

export default connect(
  state => ({
    reactStar: state.reactStar,
  }),
  dispatch => bindActionCreators({
    getReactStar,
  }, dispatch),
)(Page4);
