import React, { useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MenuIcon from '@material-ui/icons/Menu';
import Container from '@material-ui/core/Container';
import styled from 'styled-components';
import { gql, useQuery } from '@apollo/client';
import { currentUserVar } from '../src/apollo';

const Root = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
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

export default function MenuAppBar(): JSX.Element {
    const { loading, data } = useQuery(ME);
    const onLoginButtonClick = () => {
        window.location.href = '/api/auth/naver';
    };
    const onLogoutButtonClick = () => {
        window.location.href = '/api/auth/logout';
    };

    useEffect(() => {
        if (data) {
            currentUserVar(data.me);
        } else {
            currentUserVar(null);
        }
    }, [loading, data]);

    return (
        <Root>
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
                        ) : data.me ? (
                            <>
                                <Avatar src={data.me.profileImage} />
                                <div>{data.me.nickname}</div>
                                <Button
                                    color="inherit"
                                    onClick={onLogoutButtonClick}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button
                                color="inherit"
                                onClick={onLoginButtonClick}
                            >
                                Login
                            </Button>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
        </Root>
    );
}
