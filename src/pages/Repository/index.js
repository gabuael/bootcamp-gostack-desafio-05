import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { api } from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  Option,
  ChangePage,
  OptionsPage,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repositoy, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'all',
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repositoy.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilter = async filter => {
    const { repository, page } = this.state;
    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: filter,
        per_page: 5,
        page,
      },
    });
    this.setState({ issues: issues.data });
  };

  handlePage = async direction => {
    const { page: pageState, repository, filter } = this.state;
    let page = pageState;
    if (direction === 'left') {
      page--;
    } else {
      page++;
    }
    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: filter,
        per_page: 5,
        page,
      },
    });

    this.setState({ issues: issues.data, page });
  };

  render() {
    const { repository, issues, loading, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueList>
          <Option
            color="blue"
            colorPress="#0000cc"
            onClick={() => this.handleFilter('all')}
          >
            All
          </Option>
          <Option
            color="#00cc00"
            colorPress="green"
            onClick={() => this.handleFilter('open')}
          >
            Open
          </Option>
          <Option
            color="red"
            colorPress="#cc0000"
            onClick={() => this.handleFilter('closed')}
          >
            Closed
          </Option>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
          <OptionsPage>
            <ChangePage
              disabled={page === 1}
              onClick={() => this.handlePage('left')}
            >
              <FaChevronLeft color="#7159c1" size={18} />
            </ChangePage>
            <ChangePage onClick={() => this.handlePage('right')}>
              <FaChevronRight color="#7159c1" size={18} />
            </ChangePage>
          </OptionsPage>
        </IssueList>
      </Container>
    );
  }
}
