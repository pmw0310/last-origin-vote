import React from 'react';
import Link from 'next/link';
import { Paper, Typography, IconButton, Chip, Avatar } from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import styled from 'styled-components';
import { CharacterInterface, GroupInterface } from 'Module';
import { Edit, Delete } from '@material-ui/icons';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export interface CharacterItemProps {
    data: CharacterInterface | GroupInterface;
    auth: boolean;
    removeDialogOpen: (id: string) => () => void;
    type: 'char' | 'group';
}

const ItemPaper = styled(Paper)`
    margin: 12px;
    width: auto;
    height: 150px;
`;

const Item = styled.div`
    display: flex;
    align-items: flex-start;
`;

const Info = styled.div`
    display: flex;
    flex-direction: column;
    margin: 12px;
`;
const Auth = styled.div`
    display: flex;
    align-items: flex-end;
`;
const TagChip = styled(Chip)`
    margin-right: 4px;
`;

const ListItem: React.FC<CharacterItemProps> = ({
    data,
    auth,
    removeDialogOpen,
    type,
}): JSX.Element => {
    return (
        <ItemPaper>
            <Item>
                <LazyLoadImage
                    src={
                        (data as CharacterInterface).profileImage ||
                        (data as GroupInterface).image ||
                        'https://via.placeholder.com/150x150.png?text=No+Image'
                    }
                    effect="opacity"
                    width="150"
                    height="150"
                />
                <Info>
                    <Typography variant="h5" gutterBottom>
                        {data.name}
                    </Typography>
                    <div>
                        {data.tag?.map((tag, index) => (
                            <TagChip
                                variant="outlined"
                                size="small"
                                label={`#${tag}`}
                                key={`${data.name}-${index}`}
                            />
                        ))}
                    </div>
                </Info>
                {type === 'group' &&
                    ((data as GroupInterface).character as Array<
                        CharacterInterface
                    >)?.length > 0 && (
                        <AvatarGroup max={5}>
                            {((data as GroupInterface).character as Array<
                                CharacterInterface
                            >).map((char) => (
                                <Avatar
                                    key={char.id}
                                    alt={char.name}
                                    src={char.profileImage}
                                />
                            ))}
                        </AvatarGroup>
                    )}
                {auth && (
                    <Auth>
                        <Link href={`/${type}/[id]`} as={`/${type}/${data.id}`}>
                            <IconButton>
                                <Edit />
                            </IconButton>
                        </Link>
                        <IconButton
                            onClick={removeDialogOpen(data.id as string)}
                        >
                            <Delete />
                        </IconButton>
                    </Auth>
                )}
            </Item>
        </ItemPaper>
    );
};

export default ListItem;
