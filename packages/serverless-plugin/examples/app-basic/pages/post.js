class Post extends React.Component {
  static async getInitialProps({ query }) {
    return {
      slug: query.slug
    };
  }
  render() {
    return <h1>Post page: {this.props.slug}</h1>;
  }
}

export default Post;
