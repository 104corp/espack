/* eslint-disable react/style-prop-object */
import React from 'react';
import { Helmet } from 'react-helmet';


class Page3 extends React.Component {
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
          <meta name="description" content="SPA 首頁" />
          <title>SPA Page3</title>
          <body style="background-color: aliceblue;" />
        </Helmet>
        <h1 className="title title-react">React</h1>
        <br />
        <p>臺北市政府資訊開放平台天氣 api 代理連結</p>
        <ul>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=1f1aaba5-616a-4a33-867d-878142cac5c4" target="_blank" onClick={this.handleOpen}>氣溫</a></li>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=c3667669-39f8-4b82-bad9-f0f7ca859bf0" target="_blank" onClick={this.handleOpen}>露點溫度</a></li>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=c73a9461-91c8-4e5c-b728-86b6feb24ffb" target="_blank" onClick={this.handleOpen}>濕度</a></li>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=5e5f1d9a-cc42-482d-be4e-6223f4931977" target="_blank" onClick={this.handleOpen}>風</a></li>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=49c22e13-85e8-46fa-b8e7-c2bb7d4832dd" target="_blank" onClick={this.handleOpen}>舒適度</a></li>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=b35f6ac9-6d99-492a-8773-bee73656c27b" target="_blank" onClick={this.handleOpen}>天氣描述</a></li>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=00fcb626-9296-4ae1-9c87-f019871755c8" target="_blank" onClick={this.handleOpen}>降雨機率(12小時)</a></li>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=7803b298-fdca-4ccc-993f-88ba97ec3c4d" target="_blank" onClick={this.handleOpen}>降雨機率(6小時)</a></li>
          <li><a href="/opendata/datalist/apiAccess?scope=resourceAquire&rid=8ee2166f-7b71-4be3-b6f4-6db1f8d0e570" target="_blank" onClick={this.handleOpen}>天氣詳細描述</a></li>
        </ul>
      </React.Fragment>
    );
  }
}

export default Page3;
