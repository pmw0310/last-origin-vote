import React, { useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { ButtonBase } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import Container from '@material-ui/core/Container';
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
                    <Toolbar>
                        <MenuButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                        >
                            <MenuIcon />
                        </MenuButton>
                        {loading ? (
                            <div />
                        ) : data?.me ? (
                            <>
                                <Avatar src={data?.me.profileImage} />
                                <div>{data?.me.nickname}</div>
                                <ButtonBase>
                                    <img
                                        src="naver_logout.png"
                                        height={40}
                                        onClick={onLogoutButtonClick}
                                    />
                                </ButtonBase>
                            </>
                        ) : (
                            <ButtonBase>
                                <img
                                    src="naver_login.png"
                                    height={40}
                                    onClick={onLoginButtonClick}
                                />
                            </ButtonBase>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
        </Root>
    );
};

export default React.memo(MenuAppBar);
