import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import styled, { createGlobalStyle } from 'styled-components';

import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import { ButtonBase } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import IconButton from '@material-ui/core/IconButton';
import Image from 'next/image';
import Link from 'next/link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LoyaltyIcon from '@material-ui/icons/Loyalty';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import { UserInterface } from 'Module';
import ViewListIcon from '@material-ui/icons/ViewList';
import { currentUserVar } from '../lib/apollo';
import { toImage } from '../lib/info';

const GlobalStyles = createGlobalStyle`
       html body {
            height: 100%;
            overflow: auto;
            margin: 0;
            background-color: #F3F5F8;
          }
          #__next {
            height: 100%;
          }
`;
const Root = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
`;
const MenuButton = styled(IconButton)`
    margin-right: 2px;
`;
const AppBarToolbar = styled(Toolbar)`
    display: flex;
    justify-content: space-between;
`;
const Auth = styled.div`
    display: flex;
    align-items: center;
`;
const AppBarAvatar = styled(Avatar)`
    margin-right: 10px;
`;
const AppBarList = styled.div`
    width: 265px;
`;

const ME = gql`
    query {
        me {
            id
            uid
            nickname
            profileImage
            createdAt
            authority
        }
    }
`;

const MenuAppBar = (): JSX.Element => {
    const { loading, data } = useQuery<{ me: UserInterface }>(ME);
    const [state, setState] = React.useState<boolean>(false);
    const onLoginButtonClick = () => {
        window.location.href = `${process.env.SERVER_URI}/api/auth/naver`;
    };
    const onLogoutButtonClick = () => {
        window.location.href = `${process.env.SERVER_URI}/api/auth/logout`;
    };

    const toggleDrawer = (open: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent,
    ) => {
        if (
            event &&
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setState(open);
    };

    const list = () => (
        <AppBarList
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <Link href="/">
                    <ListItem button>
                        <ListItemIcon>
                            <ViewListIcon />
                        </ListItemIcon>
                        <ListItemText primary="리스트" />
                    </ListItem>
                </Link>
                <Link href="/ranking">
                    <ListItem button>
                        <ListItemIcon>
                            <EqualizerIcon />
                        </ListItemIcon>
                        <ListItemText primary="순위" />
                    </ListItem>
                </Link>
                <Divider />
                <Link href="/credits">
                    <ListItem button>
                        <ListItemIcon>
                            <LoyaltyIcon />
                        </ListItemIcon>
                        <ListItemText primary="크레딧" />
                    </ListItem>
                </Link>
            </List>
        </AppBarList>
    );

    useEffect(() => {
        if (data?.me) {
            currentUserVar(data.me);
        } else {
            currentUserVar(null);
        }
    }, [data]);

    return (
        <Root>
            <GlobalStyles />
            <AppBar position="static">
                <Container fixed>
                    <AppBarToolbar>
                        <MenuButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={toggleDrawer(true)}
                        >
                            <MenuIcon />
                        </MenuButton>
                        <Drawer
                            anchor="left"
                            open={state}
                            onClose={toggleDrawer(false)}
                        >
                            {list()}
                        </Drawer>
                        <Auth>
                            {!loading && data?.me ? (
                                <>
                                    <Tooltip
                                        title={data.me.nickname as string}
                                        aria-label={data.me.nickname}
                                    >
                                        <AppBarAvatar
                                            src={data?.me.profileImage}
                                        />
                                    </Tooltip>
                                    <ButtonBase>
                                        <Image
                                            alt="naver_logout"
                                            src={
                                                toImage(
                                                    '/public/naver_logout.png',
                                                ) as string
                                            }
                                            width={116}
                                            height={40}
                                            onClick={onLogoutButtonClick}
                                        />
                                    </ButtonBase>
                                </>
                            ) : (
                                <ButtonBase>
                                    <Image
                                        alt="naver_login"
                                        src={
                                            toImage(
                                                '/public/naver_login.png',
                                            ) as string
                                        }
                                        width={105}
                                        height={40}
                                        onClick={onLoginButtonClick}
                                    />
                                </ButtonBase>
                            )}
                        </Auth>
                    </AppBarToolbar>
                </Container>
            </AppBar>
        </Root>
    );
};

export default React.memo(MenuAppBar);
