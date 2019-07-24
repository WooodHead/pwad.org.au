import React from 'react';
import PropTypes from 'prop-types';
import {Query} from 'react-apollo';
import {kebabCase} from 'lodash';
import Text from 'mineral-ui/Text';
import Flex, {FlexItem} from 'mineral-ui/Flex';

import Link from '../components/link';
import Markdown from '../components/markdown/markdown';
import {FIND_ONE_HYMN} from '../components/queries';

function Author({_id, name, dates}) {
  const fullName = `${name.first} ${name.last}`;
  return (
    <Text>
      <Link
        as={`/author/${_id}/${kebabCase(fullName)}`}
        href={`/author?id=${_id}`}
      >
        {fullName} {dates && `(${dates})`}
      </Link>
    </Text>
  );
}

Author.propTypes = {
  _id: PropTypes.string.isRequired,
  name: PropTypes.shape({
    first: PropTypes.string,
    last: PropTypes.string
  }),
  dates: PropTypes.string
};

Author.defaultProps = {
  name: {},
  dates: undefined
};

function Composer(props) {
  if (props.name) {
    return <Author {...props} />;
  }

  return <Text>No Composer</Text>;
}

Composer.propTypes = {
  name: PropTypes.object
};

Composer.defaultProps = {
  name: undefined
};

class Song extends React.Component {
  static getInitialProps({query: {id}}) {
    return {id};
  }

  static propTypes = {
    id: PropTypes.string.isRequired
  };

  render() {
    const {id} = this.props;

    return (
      <>
        <Text as="h1" fontWeight="extraBold">
          Public Worship and Aids to Devotion Committee Website
        </Text>
        <Query query={FIND_ONE_HYMN} variables={{id}}>
          {({loading, error, data}) => {
            if (loading) {
              return 'Loading...';
            }

            if (error) {
              return `Error! ${error.message}`;
            }

            const {
              author,
              files,
              hymnNumber,
              lyrics,
              scripture,
              title,
              tune,
              wordsCopyright
            } = data.hymnById;

            return (
              <Flex
                gutterWidth="xxl"
                breakpoints={['narrow', 'medium']}
                direction={['column-reverse', 'column-reverse', 'row']}
              >
                <FlexItem>
                  {files.length > 0 && (
                    <>
                      <Text as="h3">Files</Text>
                      <Text as="ul">
                        {files.map(({_id, file}) => (
                          <li key={_id}>
                            <Link href={file.url}>
                              {file.filename} ({file.size})
                            </Link>
                          </li>
                        ))}
                      </Text>
                    </>
                  )}

                  <Text as="h3">Hymn Author</Text>
                  <Author {...author} />
                  <Text as="h3">Scripture</Text>
                  <Text>{scripture}</Text>

                  <Text as="h3">Tune Composer</Text>
                  <Composer {...tune.composer} />

                  <Text as="h3">Copyright (words)</Text>
                  <Text>{wordsCopyright}</Text>

                  <Text as="h3">Copyright (music)</Text>
                  <Text>{tune.musicCopyright}</Text>
                </FlexItem>
                <FlexItem width="100%">
                  <Text as="h2">
                    {hymnNumber}. {title}
                  </Text>
                  <Markdown>{lyrics.md}</Markdown>
                </FlexItem>
              </Flex>
            );
          }}
        </Query>
      </>
    );
  }
}

export default Song;
