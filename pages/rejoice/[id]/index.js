import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import prettyBytes from 'pretty-bytes';
import Text from 'mineral-ui/Text';
import Flex, {FlexItem} from 'mineral-ui/Flex';

import redirect from '../../../lib/redirect';
import checkLoggedIn from '../../../lib/check-logged-in';
import withApollo from '../../../lib/with-apollo-client';
import {defineAbilitiesFor} from '../../../lib/abilities';

import PageLayout from '../../../components/page-layout';
import Link, {authorLinkProps} from '../../../components/link';
import Markdown from '../../../components/markdown/markdown';
import ShortListButton from '../../../components/shortlist-button';
import {FIND_ONE_HYMN} from '../../../components/queries';

function Composer(props) {
  if (props.name) {
    return (
      <Text>
        <Link {...authorLinkProps(props)} />
      </Text>
    );
  }

  return <Text>No Composer</Text>;
}

Composer.propTypes = {
  name: PropTypes.object
};

Composer.defaultProps = {
  name: undefined
};

function Song({id}) {
  const {loading, error, data: {hymnById} = {}} = useQuery(FIND_ONE_HYMN, {
    variables: {id}
  });

  const {
    author,
    files,
    hymnNumber,
    lyrics,
    scripture,
    title,
    tune,
    wordsCopyright
  } = hymnById || {};

  return (
    <PageLayout>
      <Text as="h1" fontWeight="extraBold">
        Public Worship and Aids to Devotion Committee Website
      </Text>
      {loading && 'Loading...'}
      {error && `Error! ${error.message}`}
      {hymnById && (
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
                      <Link href={file.url} isInternal={false}>
                        {file.filename}
                      </Link>{' '}
                      ({prettyBytes(file.size)})
                    </li>
                  ))}
                </Text>
              </>
            )}

            {author && (
              <>
                <Text as="h3">Hymn Author</Text>
                <Text>
                  <Link {...authorLinkProps(author)} />
                </Text>
              </>
            )}

            {scripture && (
              <>
                <Text as="h3">Scripture</Text>
                <Text>{scripture}</Text>
              </>
            )}

            {tune && (
              <>
                <Text as="h3">Tune Composer</Text>
                <Composer {...tune.composer} />
                {tune.metre && (
                  <>
                    <Text as="h3">Metre</Text>
                    <Text>{tune.metre.metre}</Text>
                  </>
                )}
              </>
            )}

            {wordsCopyright && (
              <>
                <Text as="h3">Copyright (words)</Text>
                <Text>{wordsCopyright.name || '-'}</Text>
              </>
            )}

            {tune && tune.musicCopyright && (
              <>
                <Text as="h3">Copyright (music)</Text>
                <Text>{tune.musicCopyright.name || '-'}</Text>
              </>
            )}
          </FlexItem>
          <FlexItem width="100%">
            <Text as="h2">
              <ShortListButton hymn={hymnById} />
              {hymnNumber}. {title}
            </Text>
            <Markdown>{lyrics.md}</Markdown>
          </FlexItem>
        </Flex>
      )}
    </PageLayout>
  );
}

Song.getInitialProps = async function(context) {
  const {
    query: {id}
  } = context;

  const {loggedInUser} = await checkLoggedIn(context.apolloClient);

  if (loggedInUser.user) {
    const ability = defineAbilitiesFor(loggedInUser.user);

    if (ability.can('read', 'Hymn')) {
      return {id};
    }

    redirect(context, '/my-account');
  }

  redirect(context, '/sign-in');
};

Song.propTypes = {
  id: PropTypes.string.isRequired
};

export default withApollo(Song);
