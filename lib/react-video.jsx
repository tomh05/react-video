var React = require("react");
var classSet = require("../utils/classSet");
var ajax = require("../utils/ajax");
var PlayButton = require("./components/play-button");
var Spinner = require("./components/spinner");

module.exports = React.createClass({
  displayName: "Video",
  propTypes: {
    from: React.PropTypes.oneOf(["youtube", "vimeo", "vine"]),
    videoId: React.PropTypes.string,
    onError: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      className: "video"
    };
  },
  getInitialState() {
    return {
      thumb: null,
      imageLoaded: false,
      showingVideo: false
    };
  },
  isYoutube() {
    return this.props.from === "youtube" || isNaN(this.props.videoId);
  },
  isVimeo() {
    return this.props.from === "vimeo" || !isNaN(this.props.videoId);
  },
  isVine() {
    return this.props.from === "vine" || isNaN(this.props.videoId);
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.className !== this.props.className || nextProps.from !== this.props.from || nextProps.videoId !== this.props.videoId) {
      this.setState({
        thumb: null,
        imageLoaded: false,
        showingVideo: false
      });
    }
  },
  componentDidMount() {
    if (!this.state.imageLoaded) {
      this.isYoutube() && this.fetchYoutubeData();
      this.isVimeo() && this.fetchVimeoData();
      this.isVine() && this.fetchVineData();
    }
  },
  componentDidUpdate() {
    if (!this.state.imageLoaded) {
      this.isYoutube() && this.fetchYoutubeData();
      this.isVimeo() && this.fetchVimeoData();
      this.isVine() && this.fetchVineData();
    }
  },
  render() {
    return (
      <div className={this.props.className+" video"} >
        {!this.state.imageLoaded && <Spinner />}
        { (this.props.title)&&
            this.renderTitle(this.props.title)
        }
        {this.renderImage()}
        {this.renderIframe()}
      </div>
    );
  },
  renderTitle(title) {
    var style = {
      "z-index":1,
      "position": "absolute",
      "right":0,
      "top":0
    };

    return (
      <div className='video-title' style={this.props.titleStyle}>
        <h1>{title}</h1>
      </div>
    );
  },
  renderImage() {
    var style = {
      backgroundImage: `url(${this.state.thumb})`
    };

    if (this.state.imageLoaded && !this.state.showingVideo) {
      return (
        <div className='video-image' style={style}>
          <PlayButton onClick={this.playVideo} />
        </div>
      );
    }
  },
  renderIframe() {
    var embedVideoStyle = {
      display: this.state.showingVideo ? "block" : "none",
      width: "100%",
      height: "100%",
      backgroundImage:`url(${this.state.thumb})`
    };

    if (this.state.showingVideo) {
      return (
        <div className='video-embed' style={embedVideoStyle}>
          <iframe frameBorder='0' src={this.getIframeUrl()}></iframe>
        </div>
      );
    }
  },
  playVideo(ev) {
    this.setState({ showingVideo: true });
    ev.preventDefault();
  },
  getIframeUrl() {
    if (this.isYoutube()) { //videoseries?list=
      if (this.props.videoId)
        return `//youtube.com/embed/${this.props.videoId}?autoplay=1`
      else if(this.props.playlistId)
        return `//youtube.com/embed?listType=playlist&list=${this.props.playlistId}&disablekb=1&autoplay=1&showinfo=1`
    }
    else if (this.isVimeo()) {
      return `//player.vimeo.com/video/${this.props.videoId}?autoplay=1`
    }
    else if (this.isVine()) {
      return `//vine.co/v/${this.props.videoId}/embed/simple`
    }
  },
  fetchYoutubeData() {
    var id = this.props.videoId;
    var picture = this.props.image ? this.props.image : `http://img.youtube.com/vi/${id}/0.jpg`;
    this.setState({
      thumb: picture,
      imageLoaded: true
    })
  },
  fetchVimeoData() {
    var id = this.props.videoId;
    var that = this;

    ajax.get({
      url: `//vimeo.com/api/v2/video/${id}.json`,
      onSuccess(err, res) {
        that.setState({
          thumb: res[0].thumbnail_large,
          imageLoaded: true
        });
      },
      onError: that.props.onError
    });
  },
  fetchVineData() {
    var id = this.props.videoId;
    var that = this;

    ajax.get({
      url: `//vine.co/oembed.json?url=https%3A%2F%2Fvine.co%2Fv%2F${id}`,
      onSuccess(err, res) {
        that.setState({
          thumb: res.thumbnail_url,
          imageLoaded: true
        });
      },
      onError: that.props.onError
    });
  }
});
