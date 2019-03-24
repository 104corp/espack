/* eslint-disable react/style-prop-object */
import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getReactStar } from '../redux/modules/reactStar';
import { cancelAllAPI } from '../redux/modules/fetchAPI';

class Page4 extends React.Component {
  handleOpen = (event) => {
    if (process.env.NODE_ENV === 'production') {
      event.preventDefault();
      // eslint-disable-next-line no-alert
      alert('Only for 開發模式才有 proxy 功能');
    }
  }

  handleBtnClick = () => {
    const {
      getReactStarAction,
      // cancelAllAPIAction,
    } = this.props;
    getReactStarAction();
    // cancelAllAPIAction(); // cancel ajax
  }

  render() {
    const { reactStar } = this.props;
    return (
      <React.Fragment>
        <Helmet>
          <meta name="description" content="SPA 其他頁" />
          <title>SPA Page4</title>
          <body style="background-color: honeydew;" />
        </Helmet>
        <h1 className="title title-react">React</h1>
        <br />
        <p>代理實際線上網站平台進來，但替換部分資源</p>
        <a href="/104/jobbank/faq/" target="_blank" onClick={this.handleOpen}>Proxy 104 FAQ</a>
        <br />
        <br />
        <p>redux-observable</p>
        <button type="button" onClick={this.handleBtnClick}>
          Get React Star:
          { reactStar }
        </button>
      </React.Fragment>
    );
  }
}

Page4.propTypes = {
  reactStar: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  getReactStarAction: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  cancelAllAPIAction: PropTypes.func.isRequired,
};

Page4.defaultProps = {};

export default connect(
  state => ({
    reactStar: state.reactStar,
  }),
  dispatch => bindActionCreators({
    getReactStarAction: getReactStar,
    cancelAllAPIAction: cancelAllAPI,
  }, dispatch),
)(Page4);
