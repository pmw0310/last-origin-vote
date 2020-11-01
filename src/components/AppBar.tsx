import React, { useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { ButtonBase } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';
import styled, { createGlobalStyle } from 'styled-components';
import { gql, useQuery } from '@apollo/client';
import { currentUserVar } from '../lib/apollo';
import { UserInterface } from 'Module';

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
    const onLoginButtonClick = () => {
        window.location.href = '/api/auth/naver';
    };
    const onLogoutButtonClick = () => {
        window.location.href = '/api/auth/logout';
    };

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
                            disabled={true}
                        >
                            <MenuIcon />
                        </MenuButton>
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
                                        <img
                                            src="/naver_logout.png"
                                            height={36}
                                            onClick={onLogoutButtonClick}
                                        />
                                    </ButtonBase>
                                </>
                            ) : (
                                <ButtonBase>
                                    <img
                                        src="/naver_login.png"
                                        height={36}
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
