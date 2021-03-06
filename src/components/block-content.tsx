import React, {FC, ReactNode} from 'react';
import PropTypes from 'prop-types';
import {Styled} from 'theme-ui';
import GithubSlugger from 'github-slugger';
import SanityBlockContent from '@sanity/block-content-to-react';
import getVideoId from 'get-video-id';
import Vimeo from '@u-wave/react-vimeo';
import Youtube from '@u-wave/react-youtube';
import Link, {linkProps, GenLinkProps} from './link';

const slugger = new GithubSlugger();

type InternalLinkProps = {
  mark: {
    reference?: GenLinkProps;
  };
  children: string;
};

const InternalLink: FC<InternalLinkProps> = ({children, mark}) => {
  const reference = {...mark.reference, title: children, children};
  return <Link {...linkProps(reference)}>{children}</Link>;
};

InternalLink.propTypes = {
  mark: PropTypes.shape({
    reference: PropTypes.any
  }),
  children: PropTypes.any
};

type ExternalLinkProps = {
  mark: {
    _key?: string;
    _type?: string;
    blank?: boolean;
    href?: string;
  };
  children: ReactNode;
};

const ExternalLink: FC<ExternalLinkProps> = ({children, mark}) => {
  const reference = {...mark, isBlank: mark.blank, children, isInternal: false};
  return <Link {...reference} />;
};

ExternalLink.propTypes = {
  mark: PropTypes.shape({
    _key: PropTypes.string.isRequired,
    _type: PropTypes.string.isRequired,
    blank: PropTypes.bool,
    href: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.node.isRequired
};

type ImageProps = {
  node: {
    asset?: any;
  };
};

const Image: FC<ImageProps> = ({node}) => {
  return <img {...node.asset} />;
};

Image.propTypes = {
  node: PropTypes.shape({
    asset: PropTypes.any
  }).isRequired
};

type SerializerProps = {
  node: {
    style: string;
    children: Array<{
      text: string;
    }>;
  };
};

type VideoProps = {
  node: {
    url?: string;
  };
};

const Video: FC<VideoProps> = ({node}) => {
  const {url} = node;
  if (url) {
    const video = getVideoId(url || null);

    if (video.service === 'youtube') {
      return <Youtube modestBranding annotations={false} video={video.id} />;
    }

    if (video.service === 'vimeo') {
      return <Vimeo showTitle={false} showByline={false} video={video.id} />;
    }
  }

  return null;
};

Video.propTypes = {
  node: PropTypes.shape({
    url: PropTypes.string
  }).isRequired
};

const serializers = {
  types: {
    block: (props: SerializerProps) => {
      switch (props.node.style) {
        case 'h2': {
          const name = props.node.children.map((child) => child.text).join(' ');
          const slug = slugger.slug(name);
          return <Styled.h2 {...props} id={slug} />;
        }

        case 'h3':
          return <Styled.h3 {...props} />;
        case 'h4':
          return <Styled.h4 {...props} />;
        case 'h5':
          return <Styled.h5 {...props} />;
        case 'ul':
          return <Styled.ul {...props} />;
        case 'ol':
          return <Styled.ol {...props} />;
        case 'li':
          return <Styled.li {...props} />;
        case 'normal':
          return <Styled.p variant="prose" {...props} />;
        default:
          return <Styled.p variant="prose" {...props} />;
      }
    },
    img: Image,
    video: Video
  },
  marks: {
    internalLink: InternalLink,
    link: ExternalLink
  }
};

type BlockContentProps = {
  blocks: any;
};

const BlockContent: FC<BlockContentProps> = (props) => (
  <SanityBlockContent {...props} serializers={serializers} />
);

export default BlockContent;
