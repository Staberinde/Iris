
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Header from '../../components/Header';
import Icon from '../../components/Icon';
import PlaylistGrid from '../../components/PlaylistGrid';
import LazyLoadListener from '../../components/LazyLoadListener';
import Loader from '../../components/Loader';

import * as helpers from '../../helpers';
import * as uiActions from '../../services/ui/actions';
import * as spotifyActions from '../../services/spotify/actions';

class DiscoverCategory extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadCategory();
    this.setWindowTitle();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id != this.props.match.params.id) {
      this.loadCategory();
    }

    if (!this.props.category && nextProps.category) {
      this.setWindowTitle(nextProps.category);
    }
  }

  setWindowTitle(category = this.props.category) {
    if (category) {
      this.props.uiActions.setWindowTitle(category.name);
    } else {
      this.props.uiActions.setWindowTitle('Genre / Mood');
    }
  }

  loadCategory() {
    if (!this.props.category) {
      this.props.spotifyActions.getCategory(this.props.match.params.id);
    }

    if (!this.props.category.playlists_uris) {
      this.props.spotifyActions.getCategoryPlaylists(this.props.match.params.id);
    }
  }

  loadMore() {
    this.props.spotifyActions.getMore(
      this.props.category.playlists_more,
      null,
      {
        type: 'SPOTIFY_CATEGORY_PLAYLISTS_LOADED_MORE',
        uri: `category:${this.props.match.params.id}`,
      },
    );
  }

  render() {
    if (helpers.isLoading(this.props.load_queue, ['spotify_browse/categories/'])) {
      return (
        <div className="view discover-categories-view">
          <Header>
            <Icon name="mood" type="material" />
            {(this.props.category ? this.props.category.name : 'Category')}
          </Header>
          <Loader body loading />
        </div>
      );
    }

    if (!this.props.category) {
      return null;
    }

    const category = helpers.collate(this.props.category, { playlists: this.props.playlists });

    return (
      <div className="view discover-categories-view">
        <Header uiActions={this.props.uiActions}>
          <Icon name="mood" type="material" />
          {category.name}
        </Header>
        <div className="content-wrapper">
          <section className="grid-wrapper">
            <PlaylistGrid playlists={category.playlists} />
          </section>
          <LazyLoadListener
            loadKey={category.playlists_more}
            showLoader={category.playlists_more}
            loadMore={() => this.loadMore()}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  load_queue: state.ui.load_queue,
  playlists: state.core.playlists,
  category: (state.spotify.categories && state.spotify.categories[`category:${ownProps.match.params.id}`] !== undefined ? state.spotify.categories[`category:${ownProps.match.params.id}`] : false),
});

const mapDispatchToProps = (dispatch) => ({
  uiActions: bindActionCreators(uiActions, dispatch),
  spotifyActions: bindActionCreators(spotifyActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverCategory);
