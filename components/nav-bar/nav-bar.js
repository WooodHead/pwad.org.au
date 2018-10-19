import React from 'react';
import gql from 'graphql-tag';
import {css} from 'react-emotion';
import {Query} from 'react-apollo';
import Text from 'mineral-ui/Text';
import Box from 'mineral-ui/Box';
import Flex from 'mineral-ui/Flex';
import MineralLink from 'mineral-ui/Link';
import {createStyledComponent} from 'mineral-ui/styles';
import Link from '../link';

const ME = gql`
  {
    me {
      profilePhoto
      name {
        first
        last
      }
    }
  }
`;

const noList = css`
  list-style: none;
`;

const flexRight = css`
  margin-left: auto;
`;

const NavMenuItem = createStyledComponent(Text, {
  letterSpacing: '1px',
  textTransform: 'uppercase',
  margin: '0 1em'
});

const MenuButton = createStyledComponent(MineralLink, {
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  fontWeight: 'inherit',
  margin: '0',
  padding: '0',
  border: 'none',
  cursor: 'pointer'
});

class NavBar extends React.Component {
  constuctor() {
    this.handleMenuClick = this.handleMenuClick.bind(this);
  }

  handleMenuClick() {
    console.log('toggle');
  }

  render() {
    const count = 0;

    return (
      <Box
        element="nav"
        breakpoints={['narrow', 'medium']}
        paddingVertical={['0', '0', '15vh']}
        marginHorizontal="auto"
      >
        <Flex
          element="ul"
          justifyContent="between"
          padding="0"
          className={noList}
          breakpoints={['narrow', 'medium']}
          direction={['column', 'column', 'row']}
        >
          <NavMenuItem element="li" fontWeight="bold">
            <MenuButton element="button" onClick={this.handleMenuClick}>
              Menu
            </MenuButton>
          </NavMenuItem>
          <NavMenuItem element="li" fontWeight="bold">
            <Link prefetch href="/">
              Home
            </Link>
          </NavMenuItem>
          <NavMenuItem element="li" fontWeight="bold">
            <Link prefetch href="/">
              What is worship?
            </Link>
          </NavMenuItem>
          <NavMenuItem element="li" fontWeight="bold">
            <Link prefetch href="/">
              Worship directory
            </Link>
          </NavMenuItem>
          <NavMenuItem element="li" fontWeight="bold">
            <Link prefetch href="/">
              Worship aids
            </Link>
          </NavMenuItem>
          <NavMenuItem element="li" fontWeight="bold">
            <Link prefetch href="/">
              Useful links
            </Link>
          </NavMenuItem>
          <Query query={ME}>
            {({data}) => {
              if (data.me) {
                return (
                  <>
                    <NavMenuItem
                      element="li"
                      fontWeight="bold"
                      className={flexRight}
                    >
                      <Link prefetch href="/auth/logout">
                        Log out
                      </Link>
                    </NavMenuItem>
                    <NavMenuItem element="li" fontWeight="bold">
                      <Link prefetch href="/short-list">
                        Short list ({count})
                      </Link>
                    </NavMenuItem>
                    <NavMenuItem element="li" fontWeight="bold">
                      <Link prefetch href="/my-account">
                        My account
                      </Link>
                    </NavMenuItem>
                  </>
                );
              }

              return (
                <>
                  <NavMenuItem
                    element="li"
                    fontWeight="bold"
                    className={flexRight}
                  >
                    <Link prefetch href="/sign-in">
                      Log in
                    </Link>
                  </NavMenuItem>
                  <NavMenuItem element="li" fontWeight="bold">
                    <Link prefetch href="/create-account">
                      Create account
                    </Link>
                  </NavMenuItem>
                </>
              );
            }}
          </Query>
        </Flex>
      </Box>
    );
  }
}

export default NavBar;
