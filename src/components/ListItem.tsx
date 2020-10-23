/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import {
    Typography,
    IconButton,
    Chip,
    Avatar,
    Accordion,
    AccordionDetails,
    AccordionSummary,
} from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import styled from 'styled-components';
import { CharacterInterface, GroupInterface } from 'Module';
import { Edit, Delete, ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export interface CharacterItemProps {
    data: CharacterInterface | GroupInterface;
    auth: boolean;
    removeDialogOpen: (id: string) => () => void;
    type: 'char' | 'group';
}

const Root = styled.div`
    margin: 12px;
    width: auto;
`;

// const ItemPaper = styled(Paper)`
//     margin: 12px;
//     width: auto;
//     height: 150px;
// `;

// const Item = styled.div`
//     display: flex;
//     align-items: flex-start;
// `;

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
    const [expanded, setExpanded] = useState<boolean>(false);

    const handleChangeAccordion = (
        _event: React.ChangeEvent<any>,
        expanded: boolean,
    ): void => {
        setExpanded(expanded);
    };

    return (
        <Root>
            <Accordion expanded={expanded} onChange={handleChangeAccordion}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                >
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
                    {auth && (
                        <Auth>
                            <Link
                                href={`/${type}/[id]`}
                                as={`/${type}/${data.id}`}
                            >
                                <IconButton
                                    onClick={(event) => event.stopPropagation()}
                                    onFocus={(event) => event.stopPropagation()}
                                >
                                    <Edit />
                                </IconButton>
                            </Link>
                            <IconButton
                                onClick={(event) => {
                                    event.stopPropagation();
                                    removeDialogOpen(data.id as string);
                                }}
                                onFocus={(event) => event.stopPropagation()}
                            >
                                <Delete />
                            </IconButton>
                        </Auth>
                    )}
                </AccordionSummary>
                <AccordionDetails>
                    {type === 'group' &&
                        expanded &&
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
                </AccordionDetails>
            </Accordion>
        </Root>
    );
};

export default ListItem;
