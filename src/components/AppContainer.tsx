/* eslint-disable @typescript-eslint/no-explicit-any */

import Container from '@material-ui/core/Container';
import React from 'react';
import styled from 'styled-components';

const PaddingContainer = styled(Container)`
    padding-top: 64px;
`;

const AppContainer: React.FC<{ children: NonNullable<React.ReactNode> }> = ({
    children,
}): JSX.Element => {
    return <PaddingContainer fixed>{children}</PaddingContainer>;
};

export default AppContainer;
