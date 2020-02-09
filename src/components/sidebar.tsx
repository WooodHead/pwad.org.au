/** @jsx jsx */
import {FC} from 'react';
import {jsx, Box, Styled} from 'theme-ui';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import Link, {authorLinkProps, assetLinkProps} from './link';
import {Asset, Author, Tune, Copyright} from './queries';

/* _Function Index_
-Composer (used within SidebarTune)
-SidebarFiles
-SidebarAuthor
-SidebarScripture
-SidebarTune
-SidebarCopyright
-SidebarMusicCopyright
-Sidebar (wrapper)
*/

const Composer: FC<Author> = props => {
  if (props.name) {
    return (
      <Styled.p>
        <Link {...authorLinkProps(props)} />
      </Styled.p>
    );
  }

  return <Styled.p>No Composer</Styled.p>;
};

Composer.propTypes = {
  name: PropTypes.string
};

Composer.defaultProps = {
  name: undefined
};

export const SidebarFiles: FC<{files: Asset[]}> = ({files}) => (
  <>
    <Styled.h3>Files</Styled.h3>
    <Styled.ul
      sx={{
        listStyle: 'none',
        padding: 0
      }}
    >
      {files.map(file => (
        <li key={file._id}>
          <Link {...assetLinkProps(file)} /> ({prettyBytes(file.size || 0)})
        </li>
      ))}
    </Styled.ul>
  </>
);

SidebarFiles.propTypes = {
  files: PropTypes.array
};

SidebarFiles.defaultProps = {
  files: []
};

export const SidebarAuthor: FC<Author> = props => (
  <>
    <Styled.h3>Hymn Author</Styled.h3>
    <Styled.p>
      <Link {...authorLinkProps(props)} />
    </Styled.p>
  </>
);

SidebarAuthor.propTypes = {
  name: PropTypes.string
};

SidebarAuthor.defaultProps = {
  name: undefined
};

export const SidebarScripture: FC<{scripture: string}> = ({scripture}) => (
  <>
    <Styled.h3>Scripture</Styled.h3>
    <Styled.p>{scripture}</Styled.p>
  </>
);

SidebarScripture.propTypes = {
  scripture: PropTypes.string
};

SidebarScripture.defaultProps = {
  scripture: undefined
};

export const SidebarTune: FC<Tune> = ({composer, metre}) => (
  <>
    <Styled.h3>Tune Composer</Styled.h3>
    <Composer {...composer} />
    {metre && (
      <>
        <Styled.h3>Metre</Styled.h3>
        <Styled.p>{metre.metre}</Styled.p>
      </>
    )}
  </>
);

SidebarTune.propTypes = {
  composer: PropTypes.any,
  metre: PropTypes.any
};

SidebarTune.defaultProps = {
  composer: undefined,
  metre: undefined
};

export const SidebarCopyright: FC<Copyright> = ({name}) => (
  <>
    <Styled.h3>Copyright (words)</Styled.h3>
    <Styled.p>{name || '-'}</Styled.p>
  </>
);

SidebarCopyright.propTypes = {
  name: PropTypes.string
};

SidebarCopyright.defaultProps = {
  name: undefined
};

export const SidebarMusicCopyright: FC<Tune> = props => (
  <>
    <Styled.h3>Copyright (music)</Styled.h3>
    <Styled.p>{props?.musicCopyright.name || '-'}</Styled.p>
  </>
);

const Sidebar: FC = ({children}) => (
  <Box sx={{marginRight: '40px'}}>{children}</Box>
);

Sidebar.propTypes = {
  children: PropTypes.node
};

Sidebar.defaultProps = {
  children: undefined
};

export default Sidebar;
